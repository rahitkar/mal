const {
  List,
  Vector,
  Nil,
  KeyWord,
  MalSymbol,
  Str,
  HashMap,
} = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  next() {
    const token = this.peek();
    this.position++;
    return token;
  }

  peek() {
    return this.tokens[this.position];
  }
}

const tokenize = (str) => {
  const regexp =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(regexp)].map((v) => v[1]).slice(0, -1);
};

const read_seq = (reader, closingToken) => {
  const ast = [];
  reader.next();

  let token;
  while ((token = reader.peek()) !== closingToken) {
    if (token === undefined) throw "unbalanced";
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_list = (reader) => new List(read_seq(reader, ")"));

const read_vector = (reader) => new Vector(read_seq(reader, "]"));

const read_hashmap = (reader) => {
  const list = read_seq(reader, "}");
  if (list.length % 2 !== 0) {
    throw "Odd number of hash map arguments";
  }
  const map = new Map();
  for (let idx = 0; idx < list.length; idx += 2) {
    if (!(list[idx] instanceof Str)) {
      throw `${list[idx]} key not string`;
    }
    map.set(list[idx], list[idx + 1]);
  }
  return new HashMap(map);
};

const read_atom = (reader) => {
  var token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token);
  }
  if (token === "true") {
    return true;
  }
  if (token === "false") {
    return false;
  }
  if (token === "nil") {
    return Nil;
  }
  if (token.startsWith(":")) {
    return new KeyWord(token.slice(1));
  }

  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    const val = token
      .slice(1, token.length - 1)
      .replace(/\\(.)/g, function (_, c) {
        return c === "n" ? "\n" : c;
      });
    return new Str(val);
  }
  if (token[0] === '"') {
    throw "expected '\"', got EOF";
  }
  return new MalSymbol(token);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token[0]) {
    case "(":
      return read_list(reader);
    case "[":
      return read_vector(reader);
    case "{":
      return read_hashmap(reader);
    case ")":
      throw "unbalance )";
    case "]":
      throw "unbalance ]";
    case "}":
      throw "unbalance ]";
    case ";":
      new MalComment();
  }
  return read_atom(reader);
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
