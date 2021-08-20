class MalValue {
  pr_str(readableForm = false) {
    return "default";
  }
}

class NilValue extends MalValue {
  pr_str(readableForm = false) {
    return "nil";
  }
}

class List extends MalValue {
  constructor(tokens) {
    super();
    this.tokens = tokens;
  }

  pr_str(readableForm = false) {
    return (
      "(" + this.tokens.map((val) => pr_str(val, readableForm)).join(" ") + ")"
    );
  }
}

class Vector extends MalValue {
  constructor(tokens) {
    super();
    this.tokens = tokens;
  }

  pr_str(readableForm = false) {
    return (
      "[" + this.tokens.map((val) => pr_str(val, readableForm)).join(" ") + "]"
    );
  }
}

class HashMap extends MalValue {
  constructor(map) {
    super();
    this.map = map;
  }

  pr_str(readableForm = false) {
    let strRepresentation = "";
    let separator = "";
    this.map.forEach((value, key) => {
      strRepresentation +=
        separator +
        pr_str(key, readableForm) +
        " " +
        pr_str(value, readableForm);
      separator = ", ";
    });
    return "{" + strRepresentation + "}";
  }
}

class KeyWord extends MalValue {
  constructor(keyWord) {
    super();
    this.keyWord = keyWord;
  }

  pr_str(readableForm = false) {
    return ":" + this.keyWord;
  }
}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(readableForm = false) {
    return this.symbol;
  }
}

class Str extends MalValue {
  constructor(val) {
    super();
    this.val = val;
  }

  pr_str(readableForm = false) {
    if (readableForm) {
      return (
        '"' +
        this.val
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }
    return this.val;
  }
}

const pr_str = (val, readableForm = false) => {
  if (val instanceof MalValue) return val.pr_str(readableForm);
  return val.toString();
};

const Nil = new NilValue();

module.exports = {
  MalValue,
  List,
  Vector,
  Nil,
  pr_str,
  KeyWord,
  MalSymbol,
  Str,
  HashMap,
};
