const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const Env = require("./env");
const { List, Vector, HashMap, MalSymbol, Nil, Fn } = require("./types");
const { core } = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const coreEnv = core;

const eval_ast = (ast, env) => {
  if (ast === undefined) {
    return Nil;
  }

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

const evaluateDef = (ast, env) => {
  if (ast.ast.length > 3) {
    throw "Incorrect number of arguments to def!";
  }
  return env.set(ast.ast[1], EVAL(ast.ast[2], env));
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }

    if (ast.ast[0].symbol === "def!") {
      return evaluateDef(ast, env);
    }
    if (ast.ast[0].symbol === "let*") {
      if (ast.ast.length > 3) {
        throw "Incorrect number of arguments to let*";
      }
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;
      for (let idx = 0; idx < bindings.length; idx += 2) {
        newEnv.set(bindings[idx], EVAL(bindings[idx + 1], newEnv));
      }
      env = newEnv;
      ast = ast.ast[2];
      continue;
    }

    if (ast.ast[0].symbol === "if") {
      const [_, condition, expression1, expression2] = ast.ast;
      const result = EVAL(condition, env);
      if (result === false || result === Nil) {
        ast = expression2;
      } else {
        ast = expression1;
      }
      continue;
    }

    if (ast.ast[0].symbol === "do") {
      ast.ast
        .slice(1, -1)
        .reduce((_, currentVal) => EVAL(currentVal, env), ast.ast[1]);
      ast = ast.ast[ast.ast.length - 1];
      continue;
    }

    if (ast.ast[0].symbol === "fn*") {
      return new Fn(env, ast.ast[1].ast, ast.ast[2]);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof Fn) {
      env = Env.CreateEnv(fn.env, fn.bindings, args);
      ast = fn.body;
      continue;
    }

    if (fn instanceof Function) {
      return fn(args);
    }

    throw `${fn} is not a function`;
  }
};

const PRINT = (val) => pr_str(val, true);
const rep = (str) => PRINT(EVAL(READ(str), coreEnv));

// rep("(def! not (fn* (a) (if a false true)))", coreEnv);

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
