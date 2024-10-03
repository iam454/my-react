import Shared from "./SharedInternal";
import { createDom, updateDom } from "./MyReactDOM";

/**
 * Fiber 자료구조
 * dom: 연결된 DOM 요소
 * type: 컴포넌트 타입(html tag, 함수형 컴포넌트)
 * props: 해당 컴포넌트의 props
 * alternate: 이전 Fiber 트리
 * parent: 부모 Fiber 노드
 * child: 첫 자식 Fiber 노드
 * sibling: 다음 형제 Fiber 노드
 * effectTag: 발생한 변경점(UPDATE, PLACEMENT, DELETION)
 */

export const createRootImpl = (container, element) => {
  Shared.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: Shared.currentRoot,
  };
  Shared.deletions = []; // 삭제할 Fiber 노드를 담을 배열, 커밋 과정에서 사용
  Shared.nextUnitOfWork = Shared.wipRoot;
  requestIdleCallback(workLoop);
};

const workLoop = () => {
  while (Shared.nextUnitOfWork) {
    Shared.nextUnitOfWork = performUnitOfWork(Shared.nextUnitOfWork);
  }

  if (!Shared.nextUnitOfWork && Shared.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

const performUnitOfWork = (fiber) => {
  if (typeof fiber.type === "function") {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
};

const updateFunctionComponent = (fiber) => {
  Shared.wipFiber = fiber;
  Shared.hookIndex = 0;
  Shared.wipFiber.hooks = []; // 작업 중인 fiber에 배열을 추가해서 하나의 컴포넌트에 여러 상태를 갖을 수 있게
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
};

const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      // 업데이트
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    } else if (element && !sameType) {
      // 추가
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    } else if (oldFiber && !sameType) {
      // 제거
      oldFiber.effectTag = "DELETION";
      Shared.deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
};

export const commitRoot = () => {
  Shared.deletions.forEach(commitWork);
  commitWork(Shared.wipRoot.child);
  Shared.currentRoot = Shared.wipRoot;
  Shared.wipRoot = null;
};

const commitWork = (fiber) => {
  if (!fiber) {
    return;
  }

  const domParent = findDomParent(fiber);

  const effectHandlers = {
    PLACEMENT: () => {
      fiber.dom && domParent.appendChild(fiber.dom);
    },
    UPDATE: () => {
      fiber.dom && updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    },
    DELETION: () => {
      commitDeletion(fiber, domParent);
      return;
    },
  };
  const effectHandler = effectHandlers[fiber.effectTag];
  if (effectHandler) {
    effectHandler();
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const findDomParent = (fiber) => {
  let parentFiber = fiber.parent;
  while (parentFiber && !parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  return parentFiber.dom;
};

const commitDeletion = (fiber, domParent) => {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
};
