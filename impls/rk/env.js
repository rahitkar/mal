const { MalSymbol } = require("./types");

class Env {
  constructor(outer = null) {
    this.data = new Map();
    this.outer = outer;
  }

  static CreateEnv(env, binds = [], exprs = []) {
    const newEnv = new Env(env);
    for (let i = 0; i < binds.length; i++) {
      if (binds[i] instanceof MalSymbol) newEnv.set(binds[i], exprs[i]);
      else throw "expected symbol but found: " + binds[i];
    }
    return newEnv;
  }

  set(symbol, malValue) {
    this.data.set(symbol.symbol, malValue);
    return malValue;
  }

  find(symbol) {
    if (this.data.has(symbol.symbol)) return this;
    return this.outer && this.outer.find(symbol);
  }

  get(symbol) {
    const env = this.find(symbol);
    if (env) {
      return env.data.get(symbol.symbol);
    }
    throw `${symbol.symbol} not found`;
  }
}

module.exports = Env;
