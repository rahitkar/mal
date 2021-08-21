const Env = require("./env");
const { MalSymbol, Nil, List, Vector } = require("./types");
const { pr_str } = require("./printer");

const core = new Env(null);

core.set(new MalSymbol("+"), (args) => args.reduce((r, x) => r + x, 0));

core.set(new MalSymbol("-"), (args) => {
  if (args.length === 0) {
    throw `wrong number of args(${args.length}) passed to : -`;
  }
  return args.reduce((r, x) => r - x);
});

core.set(new MalSymbol("*"), (args) => args.reduce((r, x) => r * x, 1));

core.set(new MalSymbol("/"), (args) => {
  if (args.length === 0) {
    throw `wrong number of args(${args.length}) passed to : /`;
  }
  return args.reduce((r, x) => r / x);
});

core.set(new MalSymbol("prn"), (args) => {
  args[0] && console.log(pr_str(args[0]));
  return new Nil();
});

core.set(new MalSymbol("list"), (args) => {
  return new List(args);
});

core.set(new MalSymbol("list?"), (args) => {
  return args[0] instanceof List;
});

core.set(new MalSymbol("empty?"), (args) => {
  if (args[0] instanceof List || args[0] instanceof Vector)
    return args[0].isEmpty();
  throw "count does not support type: " + args[0];
});

core.set(new MalSymbol("count"), (args) => {
  if (args[0].count !== undefined) return args[0].count();
  throw "count does not support type: " + args[0];
});

core.set(new MalSymbol("="), (args) => {
  if (args.length === 0) throw `wrong number of args`;
  const [expression1, expression2] = args;
  return expression1 === expression2;
});

core.set(new MalSymbol(">"), (args) => {
  if (args.length === 0) throw `wrong number of args`;
  return args.slice(0, -1).every((x, i) => x > args[i + 1]);
});

core.set(new MalSymbol("<"), (args) => {
  if (args.length === 0) throw `wrong number of args`;
  return args.slice(0, -1).every((x, i) => x < args[i + 1]);
});

core.set(new MalSymbol(">="), (args) => {
  if (args.length === 0) throw `wrong number of args`;
  return args.slice(0, -1).every((x, i) => x >= args[i + 1]);
});

core.set(new MalSymbol("<="), (args) => {
  if (args.length === 0) throw `wrong number of args`;
  return args.slice(0, -1).every((x, i) => x <= args[i + 1]);
});

core.set(new MalSymbol("pr-str"), (args) => {
  const strings = args.map(pr_str);
  console.log(strings);
  return '"' + strings.join(" ") + '"';
});

module.exports = { core };
