class Node {
    constructor() {
        this.probilities = {};
        this.instances = [];
        this.children = [];
    }

    getProbility(label) {
        return this.probilities[label];
    }

    setProbility(label, value) {
        this.probilities[label] = value;
    }

    copy() {
        const newNode = new Node();

        for (let i in this.probilities) {
            newNode.setProbility(i, this.probilities[i]);
        }

        for (let i in this.instances) {
            newNode.instances[i] = this.instances[i];
        }

        for (let i in this.children) {
            newNode.children[i] = this.children[i].copy();
        }

        return newNode;
    }
}

const headers = [];
const rows = [];
const root = null;

// tests
// const headers = ['colour', 'nuclei', 'tails'];

// const rows = [
//     ['white', '1', '1'],
//     ['white', '2', '2'],
//     ['black', '2', '2'],
//     ['black', '3', '1'],
// ];

// const headers = ['body-cover', 'heart-chamber', 'body-temp', 'fertilization'];

// const rows = [
//     ['scales', '2', 'unregulated', 'external'],
//     ['moisk-skin', '3', 'unregulated', 'external'],
//     ['hair', '4', 'regulated', 'internal'],
//     ['feathers', '4', 'regulated', 'internal'],   
//     ['scales', '2', 'unregulated', 'external'], 
//     ['moisk-skin', '3', 'unregulated', 'external'],
// ];

// const headers = ['', 'body-temp', 'fertilization'];

// const rows = [
//     ['scales', '2', 'unregulated', 'external'],
//     ['moisk-skin', '3', 'unregulated', 'external'],
//     ['hair', '4', 'regulated', 'internal'],
//     ['feathers', '4', 'regulated', 'internal'],    
// ];
// ----

function get_value_repetition_amount(list) {
    const repetitions = {};

    for(let i in list) {
        if (repetitions[list[i]] === undefined) 
            repetitions[list[i]] = 1;
        else 
            repetitions[list[i]]++;
    }

    return repetitions;
}

function get_instance_values_by_column_idx(idx, instances) {
    return instances.map(row => row[idx]);
}

function update_node_probilities(node, headers, instances) {
    
    for (let i in headers) {
        const instance_values = get_instance_values_by_column_idx(i, instances);
        const value_repetitions = get_value_repetition_amount(instance_values);

        for (let j in value_repetitions) {
            node.setProbility(`${headers[i]}|${j}`, value_repetitions[j] / instance_values.length);
        }
    }

}

function initialize_tree(headers, instance) {
    const node = new Node();

    node.instances.push(instance);
    update_node_probilities(node, headers, [instance]);

    return node;
}

function merge(node1, node2, node3) {
    const nodeMerge = new Node();
    const instances = [...node1.instances, ...node2.instances, ...node3.instances];
    const children = [node1, node2, node3];

    nodeMerge.instances = instances;
    update_node_probilities(nodeMerge, headers, nodeMerge.instances);

    nodeMerge.children = children;
    
    return nodeMerge;
}

function split(node) {
    if (node.children.length !== 0) {
        return node.children;
    }

    return [];
}

function calculate_category_utility(nodes) {
    const instances = [];
    for (let i in nodes) {
        for (let j in nodes[i].instances) {
            instances.push(nodes[i].instances[j]);
        }
    }

    let iSum = 0.0;
    for (let i in instances) {
        for (let j in instances[i]) {
            
            const repetitions = get_value_repetition_amount(
                get_instance_values_by_column_idx(j, instances)
            )

            for (let field in repetitions) {
                iSum += Math.pow(repetitions[field] / instances.length, 2);
            }
        }

        break;
    }

    // ------------------------------------------

    let tSum = 0.0;
    for (let i in nodes) {
        let nodeSum = 0.0;

        for (let j in nodes[i].probilities) {
            nodeSum += Math.pow(nodes[i].probilities[j], 2);
        }

        // tSum += (nodes[i].instances.length / instances.length) * (nodeSum - iSum);
        tSum += (nodes[i].instances.length / instances.length) * (nodeSum);
    }

    const uc = (tSum - iSum) / nodes.length;
    return uc;
}

function copy_instances(instances) {
    const newInstances = [];

    for (let i in instances) {
        const instance_row = [];
        for (let j in instances[i]) {
            instance_row.push(instances[i][j]);
        }
        newInstances.push(instance_row);
    }

    return newInstances;
}

function copy_all_children(children) {
    const newChildren = [];
    for (let i in children) {
        newChildren.push(children[i].copy());
    }

    return newChildren;
}

function remove_by_idx(list, idx) {
    return list.filter((_, lIdx) => idx.indexOf(lIdx) === -1);
}

function cobweb(root, instance) {

    if (root.children.length === 0) {
        const l1 = new Node();
        const l2 = new Node();

        l1.instances = copy_instances(root.instances);
        update_node_probilities(l1, headers, l1.instances);

        l2.instances.push(instance);
        update_node_probilities(l2, headers, l2.instances);

        root.instances.push(instance);
        update_node_probilities(root, headers, root.instances);

        root.children.push(l1);
        root.children.push(l2);
    } else {

        root.instances.push(instance);
        update_node_probilities(root, headers, root.instances);

        let best_children = [];
        for (let i in root.children) {
            const tmp_children = copy_all_children(root.children);

            tmp_children[i].instances.push(instance);
            update_node_probilities(tmp_children[i], headers, tmp_children[i].instances);

            best_children.push([
                calculate_category_utility(tmp_children), tmp_children[i], i
            ]);
        }
        best_children.sort((a, b) => a[0] < b[0] ? 1 : -1);
        best_children = [best_children[0], best_children[1]];

        const tmp_new_class = new Node();
        tmp_new_class.instances.push(instance);
        update_node_probilities(tmp_new_class, headers, tmp_new_class.instances);

        const cu_if_new_class = calculate_category_utility([...root.children, tmp_new_class]);

        let merged_cu = null;
        let merged_node = null
        if (best_children.length === 2) {
            merged_node = merge( 
                root.children[Number(best_children[0][2])],
                root.children[Number(best_children[1][2])],
                tmp_new_class.copy()
            );

            merged_cu = calculate_category_utility([
                merged_node,
                ...remove_by_idx( root.children, [Number(best_children[0][2]), Number(best_children[1][2])]) 
            ]);
        }
        
        let split_cu = null;
        let split_node_results = [];
        if (best_children[0][1].children.length > 0) {

            split_node_results = [
                tmp_new_class,
                ...split(root.children[best_children[0][2]]),
                ...remove_by_idx( root.children, [Number(best_children[0][2])])
            ];

            split_cu = calculate_category_utility(split_node_results);
        }

        const options = [
            ['add', best_children[0][0]],
            ['new', cu_if_new_class]
        ];
        if (merged_cu !== null) options.push(['merge', merged_cu]);
        if (split_cu !== null) options.push(['split', split_cu]);

        options.sort((a, b) => a[1] > b[1] ? -1 : 1);

        if (options[0][0] === 'add') {
            cobweb(root.children[best_children[0][2]], instance);
        } else if (options[0][0] === 'new') {
            root.children.push(tmp_new_class);
        } else if (options[0][0] === 'merge') {
            root.children = remove_by_idx(root.children, [Number(best_children[0][2]), Number(best_children[1][2])] );
            root.children.push(merged_node);
        } else if (options[0][0] === 'split') {
            root.children = split_node_results;
        }

    }
}

