import { createRootImpl } from "./MyReconciler";

const createRoot = (container) => {
  return {
    render(element) {
      createRootImpl(container, element);
    },
  };
};

export const createDom = (fiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
};

export const updateDom = (dom, prevProps, nextProps) => {
  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  const isGone = (prev, next) => (key) => !(key in next);

  // 이전 props와 event를 제거
  Object.keys(prevProps).forEach((key) => {
    if (isProperty(key) && isGone(prevProps, nextProps)(key)) {
      dom[key] = "";
    }

    if (
      isEvent(key) &&
      (!(key in nextProps) || isNew(prevProps, nextProps)(key))
    ) {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    }
  });

  // 새로운 props와 event를 추가
  Object.keys(nextProps).forEach((key) => {
    if (isProperty(key) && isNew(prevProps, nextProps)(key)) {
      dom[key] = nextProps[key];
    }

    if (isEvent(key) && isNew(prevProps, nextProps)(key)) {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[key]);
    }
  });
};

const MyReactDOM = {
  createRoot,
};

export default MyReactDOM;
