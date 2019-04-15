const fs = require ("fs");
const prompt = require ("readline-sync");
const path = require ("path");

class Node {
    constructor (name, value, parent=null, children=[]) {
        this.name = name;
        this.value = 0;
        this.initalValue = value;
        this.inheritance = 0;
        this.parent = parent;
        this.children = children;
    }

    getChild (childName) {
        let node = this.children.find (x => x.name === childName);
        if (node) return node;
        else {
            for (var i = 0; i < this.children.length; i++) {
                node = this.children[i].getChild (childName);
                if (node) return node;
            } 
        }
    }

    forwardPropagate () {
        let childCount = this.children.length;
        let inheritancePart = (this.inheritance + this.initalValue) / childCount;

        for (var i = 0; i < childCount; i++) {
            let child = this.children[i];

            child.inheritance = Math.floor (inheritancePart);
            child.value = child.inheritance + child.initalValue;
            child.forwardPropagate ();
        }

        if (childCount > 0)
            this.value = 0;
    }

    getRichestChild () {
        var richestChild = null;

        for (var i = 0; i < this.children.length; i ++) {
            let child = this.children[i];
            
            if (child.children.length > 0) {
                child = child.getRichestChild ();
            } 

            if (!richestChild || child.value > richestChild.value) {
                richestChild = child;
            }
        }

        return richestChild;
    }
}

var files = fs.readdirSync (path.join (__dirname, "files"));
console.log ("Escolha o arquivo a ser lido: ");
for (var i = 0; i < files.length; i++) {
    console.log (`${i} - ${files[i]}`);
}
var selectedFile = prompt.questionInt ("> ");


fs.readFile (path.join (path.join (__dirname, "files"), files[selectedFile]), (error, input) => {
    if (error) {
        return console.error (error);
    }

    input = input.toString ();
    
    let tree = [];

    let lines = input.split ("\n");
    let qtdTerras = parseInt (lines[0]);
    let rootNode = null;
    let startTime = Date.now ();
    for (var i = 1; i < lines.length; i++) {
        let line = lines[i].trim ();
        if (line.length <= 0) continue;

        let parts = line.split (" ").filter (x => x);

        let pai = parts[0];
        let filho = parts[1];
        let terras = parseInt (parts[2]);

        if (i == 1) {
            rootNode = new Node (pai, qtdTerras, null);
            tree.push (rootNode);
        }

        let node = new Node (filho, terras, pai);
        tree.push (node);
    }

    function findNode (nodeName) {
        return tree.find (x => x.name === nodeName);
    }

    for (var i = 0; i < tree.length; i++) {
        let node = tree[i];
        if (node.parent) {
            let parentNode = findNode (node.parent);

            parentNode.children.push (node);
        }
    }

    rootNode.forwardPropagate ();
    let richestNode = rootNode.getRichestChild ();

    let endTime = Date.now ();
    console.log (`Spent ${endTime - startTime}ms`);
    console.log (JSON.stringify (richestNode, "\n", "  "));
    fs.writeFileSync (`${__dirname}/output.json`, JSON.stringify (rootNode, "\n", "\t"));
});