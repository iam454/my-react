import MyReact from "./core/MyReact";

const App = () => {
  const [count, setCount] = MyReact.useState(0);
  const [count2, setCount2] = MyReact.useState(0);

  return (
    <div style="background: salmon">
      <h1>Hello World</h1>
      <h2 style="text-align: right">from MyReact</h2>
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
        <p>Count2: {count2}</p>
        <button onClick={() => setCount2((prev) => prev + 1)}>Increment</button>
      </div>
    </div>
  );
};

export default App;
