const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { List, Vector, HashMap, MalSymbol } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  "+": (args) => args.reduce((r, x) => r + x, 0),
  "-": (args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args`);
    }
    return args.reduce((r, x) => r - x);
  },
  "*": (args) => args.reduce((r, x) => r * x, 1),
  "/": (args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args`);
    }
    return args.reduce((r, x) => r / x);
  },
  pi: 3.14,
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    if (env[ast.symbol] === undefined) {
      throw new Error("symbol not defined: " + ast);
    }
    return env[ast.symbol];
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
