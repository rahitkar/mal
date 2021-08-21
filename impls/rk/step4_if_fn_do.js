const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const Env = require("./env");
const { List, Vector, HashMap, MalSymbol, Nil } = require("./types");
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

const evaluateLet = (ast, env) => {
  if (ast.ast.length > 3) {
    throw "Incorrect number of arguments to let*";
  }
  const newEnv = new Env(env);
  const bindings = ast.ast[1].ast;
  for (let idx = 0; idx < bindings.length; idx += 2) {
    newEnv.set(bindings[idx], EVAL(bindings[idx + 1], newEnv));
  }
  return EVAL(ast.ast[2], newEnv);
};

const evaluateDef = (ast, env) => {
  if (ast.ast.length > 3) {
    throw "Incorrect number of arguments to def!";
  }
  return env.set(ast.ast[1], EVAL(ast.ast[2], env));
};

const evaluateIf = (ast, env) => {
  const [_, condition, expression1, expression2] = ast.ast;
  const result = EVAL(condition, env);
  if (result === false || result === Nil) {
    return EVAL(expression2, env);
  }
  return EVAL(expression1, env);
};

const evaluateDo = (ast, env) => {
  return ast.ast
    .slice(1)
    .reduce((_, currentVal) => EVAL(currentVal, env), ast.ast[1]);
};

const evaluateFn = (ast, env) => {
  return (args) => {
    const evaluatedArgs = args.map((x) => EVAL(x, env));
    const newEnv = Env.CreateEnv(env, ast.ast[1].ast, evaluatedArgs);
    let result = Nil;
    ast.ast.slice(2).forEach((val) => {
      result = EVAL(val, newEnv);
    });
    return result;
  };
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
    return evaluateDef(ast, env);
  }
  if (ast.ast[0].symbol === "let*") {
    return evaluateLet(ast, env);
  }

  if (ast.ast[0].symbol === "if") {
    return evaluateIf(ast, env);
  }

  if (ast.ast[0].symbol === "do") {
    return evaluateDo(ast, env);
  }

  if (ast.ast[0].symbol === "fn*") {
    return evaluateFn(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (fn instanceof Function) {
    return fn(args);
  }

  throw `${fn} is not a function`;
};

const PRINT = (val) => pr_str(val, true);
const rep = (str) => PRINT(EVAL(READ(str), coreEnv));

rep("(def! not (fn* (a) (if a false true)))", coreEnv);

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
