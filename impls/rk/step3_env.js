const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const Env = require("./env");
const { List, Vector, HashMap, MalSymbol } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();
env.set(new MalSymbol("+"), (args) => args.reduce((r, x) => r + x, 0));
env.set(new MalSymbol("-"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : -`);
  }
  return args.reduce((r, x) => r - x);
});
env.set(new MalSymbol("*"), (args) => args.reduce((r, x) => r * x, 1));
env.set(new MalSymbol("/"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : /`);
  }
  return args.reduce((r, x) => r / x);
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const symbol = env.get(ast);
    if (symbol === undefined) {
      throw "symbol not defined: " + ast;
    }
    return symbol;
  }
  if (ast instanceof List) {
    const evaluatedList = ast.ast.map((val) => EVAL(val, env));
    return new List(evaluatedList);
  }
  if (ast instanceof Vector) {
    const evaluatedVector = ast.ast.map((val) => EVAL(val, env));
    return new Vector(evaluatedVector);
  }

  if (ast instanceof HashMap) {
    const evaluatedHashMap = new Map();
    ast.map.forEach((value, key) => {
      evaluatedHashMap.set(key, EVAL(value, env));
    });
    return new HashMap(evaluatedHashMap);
  }

  return ast;
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }

  if (ast.ast[0].symbol === "def!") {
    if (ast.ast.length > 3) {
      throw "Incorrect number of arguments to def!";
    }
    return env.set(ast.ast[1], EVAL(ast.ast[2], env));
  }
  if (ast.ast[0].symbol === "let*") {
    if (ast.ast.length > 3) {
      throw "Incorrect number of arguments to let*";
    }
    const newEnv = new Env(env);
    console.log(ast.ast[1]);
    const bindings = ast.ast[1].ast;
    for (let idx = 0; idx < bindings.length; idx += 2) {
      newEnv.set(bindings[idx], EVAL(bindings[idx + 1], newEnv));
    }
    console.log(newEnv, EVAL(ast.ast[2], newEnv));
    return EVAL(ast.ast[2], newEnv);
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (fn instanceof Function) {
    return fn(args);
  }

  throw `${fn} is not a function`;
};

const PRINT = (val) => pr_str(val, true);
const rep = (str) => PRINT(EVAL(READ(str), env));

const main = () => {
  rl.question("user> ", (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();
