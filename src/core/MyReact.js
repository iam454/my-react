import Shared from "./SharedInternal";

const createElement = (type, props = {}, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
};

const createTextElement = (text) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

const useState = (initialState) => {
  const previousHook = Shared.wipFiber.alternate?.hooks?.[Shared.hookIndex];
  const currentHook = {
    state: previousHook ? previousHook.state : initialState,
    queue: [],
  };

  // 이전 훅의 대기 중인 액션 실행
  const pendingActions = previousHook ? previousHook.queue : [];
  pendingActions.forEach((action) => {
    currentHook.state =
      typeof action === "function" ? action(currentHook.state) : action;
  });

  const setState = (action) => {
    currentHook.queue.push(action);

    // 다음 작업 단위 설정
    Shared.wipRoot = {
      dom: Shared.currentRoot.dom,
      props: Shared.currentRoot.props,
      alternate: Shared.currentRoot,
    };
    Shared.nextUnitOfWork = Shared.wipRoot;
    Shared.deletions = [];
  };

  Shared.wipFiber.hooks.push(currentHook);
  Shared.hookIndex++;

  return [currentHook.state, setState];
};

const MyReact = {
  createElement,
  useState,
};

export default MyReact;
