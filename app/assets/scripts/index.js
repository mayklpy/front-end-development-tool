import "../styles/index.scss";

if (module.hot) {
  module.hot.accept();
}

class Hello {
  constructor(name) {
    this.greeting = "Hello";
    this.name = name;
    this.events();
  }

  events() {
    this.greet();
  }

  greet() {
    return `this.greeting ${this.name}`;
  }
}

export default Hello;

let h = new Hello("World!");

console.log(h);
