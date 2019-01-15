const inputs = [];

function getRandomId() {
  return `${Math.floor(1000000 * Math.random())}`;
}

class EventGraphNode {
  constructor(type, id) {
    this.type = type;
    this.id = id;
    this.inputs = new Set();
  }

  setParams(params) {
    this.params = params;
    return this;
  }

  addInput(nodeId) {
    if (!nodeId) { return; }
    this.inputs.add(nodeId);
  }

  getInputs() {
    return this.inputs;
  }
}

class EventGraph {
  constructor() {
    this.nodes = [];
    this.currentNode;
  }

  addNode(node) {
    if (this.currentNode && node.id) {
      this.currentNode.addInput(node.id);
    }
    this.nodes.push(node);
    this.currentNode = node;
    return this;
  }
}

function eventNodeWrapper(transformer) {
  function higherOrderFunction(param) {
    if (param instanceof EventGraph) {
      return transformer(param);
    }
    if (typeof param === 'function') {
      return arg => {
        const result = param(arg);
        if (result instanceof EventGraph) {
          return transformer(result);
        }
        return higherOrderFunction(result);
      };
    }
    throw new TypeError(`Invalid type: ${param}`);
  }
  return higherOrderFunction;
}

function addr(a) {
  const id = getRandomId();
  return eventNodeWrapper((graph) => {
    const address = new EventGraphNode('ADDRESS', id).setParams({ address: a });
    graph.addNode(address);
    inputs.push(graph);
    return graph;
  });
}

function reverb(reverbValue) {
  const id = getRandomId();
  return eventNodeWrapper((graph) => {
    const reverb = new EventGraphNode('REVERB', id).setParams({ reverbValue: reverbValue });
    return graph.addNode(reverb);
  });
}

const osc = {
  sin: (attack, sustain, release) => {
    const id = getRandomId();
    const params = { attack, sustain, release, };
    return eventNodeWrapper((graph) => {
      const gain = new EventGraphNode('OSC.SIN', id).setParams(params);
      return graph.addNode(gain);
    });
  },
};

function gain(gainValue) {
  const id = getRandomId();
  return eventNodeWrapper((graph) => {
    const gain = new EventGraphNode('GAIN', id).setParams({ gainValue: gainValue });
    return graph.addNode(gain);
  });
}

function dac() {
  const dac = new EventGraphNode('DAC', 'DAC_ID');
  return new EventGraph().addNode(dac);
}


const _gain = gain(0.5);

addr('a') (osc.sin(10, 10, 100)) (_gain) (dac())
addr('b') (osc.sin(10, 10, 100)) (_gain) (reverb(1)) (dac())
addr('c') (gain(0.5)) (reverb(1))

const allNodes = inputs.flatMap(graph => graph.nodes);
const uniqueNodes = allNodes.reduce((nodeMap, node) => {
  if (nodeMap[node.id]) {
    Array.from(node.getInputs()).forEach(input => nodeMap[node.id].addInput(input));
  } else {
    nodeMap[node.id] = node;
  }
  return nodeMap;
}, {});

// const dacNode = uniqueNodes.find(node => node.id === 'DAC_ID');
console.log('dacNode', uniqueNodes['DAC_ID']);

// on graph similarity: need to define or formalize similarity
// identical upstream edge
// identical downstream edge
// best cases: both or neither
// worst case: neither but still in graph (node is moved)

// console.log('allNodes:', allNodes);
console.log('\n\nuniqueNodes', uniqueNodes);
