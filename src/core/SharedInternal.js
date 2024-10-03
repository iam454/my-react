// core에서 내부적으로 가지는 전역 상태
const Shared = {
  nextUnitOfWork: null,
  wipRoot: null,
  currentRoot: null,
  deletions: null,
  wipFiber: null,
  hookIndex: null,
};

export default Shared;
