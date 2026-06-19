export type TreeNode<Node, Leaf> = {
  node: Node;
  leaves: Leaf[];
  children: TreeNode<Node, Leaf>[];
};

export class Tree<Node, Leaf> {
  private readonly root: TreeNode<Node, Leaf>[] = [];

  constructor(
    private readonly displayNode: (node: Node) => string | null = (n) =>
      String(n),
    private readonly displayLeaf: (leaf: Leaf) => string = (leaf) =>
      String(leaf),
    private readonly indent: (i: number) => string = (i) => {
      return Array.from(new Array(i))
        .map(() => "  ")
        .join("");
    },
  ) {}

  addLeaf(nodes: Node[], leaf: Leaf) {
    let currentNodes = this.root;
    let currentNode: TreeNode<Node, Leaf> | null = null;

    for (const ancestor of nodes) {
      currentNode =
        currentNodes.find(({ node }) => {
          return node === ancestor;
        }) ?? null;

      if (!currentNode) {
        currentNode = {
          leaves: [],
          node: ancestor,
          children: [],
        };
        currentNodes.push(currentNode);
      }
      currentNodes = currentNode.children;
    }
    if (currentNode) {
      currentNode.leaves.push(leaf);
    }
  }

  display(indent = 2): string[] {
    return this.displayNodes(this.root, 0);
  }

  get tree(): TreeNode<Node, Leaf>[] {
    return this.root;
  }

  private displayNodes(
    nodes: TreeNode<Node, Leaf>[],
    indent: number,
  ): string[] {
    return nodes.reduce((acc, { node, children, leaves }) => {
      return [
        ...acc,
        `${this.indent(indent)}${this.displayNode(node)}`,
        ...this.displayNodes(children, indent + 1),
        ...leaves.map(
          (leaf) => `${this.indent(indent + 1)}${this.displayLeaf(leaf)}`,
        ),
      ];
    }, [] as string[]);
  }
}
