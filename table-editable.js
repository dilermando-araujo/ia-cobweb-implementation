const table_values = [
    ['Body Temp', 'Body Cover'],
    ['Un', 'Hair']
];

function change_table_value(i, j, value) {
    table_values[i][j] = value;
}

function render_table(table_values) {

    let htmlTr = '';

    let isTh = true;
    for (let i in table_values) {

        htmlTr += '<tr>';

        for (let j in table_values[i]) {

            if (isTh) {
                htmlTr += `<th><input oninput="change_table_value(${i}, ${j}, this.value)" type="text" value="${table_values[i][j]}" /></th></th>`;
            } else {
                htmlTr += `<td><input oninput="change_table_value(${i}, ${j}, this.value)" type="text" value="${table_values[i][j]}" /></td>`;
            }

        }

        isTh = false;
        htmlTr += '</tr>';

    }

    document.getElementById('table-content').innerHTML = `
        ${htmlTr}
    `;
}

function add_column_to_table_value() {
    for (let i in table_values) {
        table_values[i].push('');
    }

    render_table(table_values);
}

function remove_column_from_table_value() {
    for (let i in table_values) {
        table_values[i].pop();
    }

    render_table(table_values);
}

function add_row_to_table_value() {
    
    let column_count = 1;
    
    for (let i in table_values) {
        column_count = table_values[i].length;
        break;
    }

    const new_row = [];
    for (let i = 0; i < column_count; i++) {
        new_row.push('');
    }

    table_values.push(new_row);
    render_table(table_values);
}

function remove_row_from_table_value() {
    table_values.pop();
    render_table(table_values);
}

function render_tree() {
    document.getElementById('body').innerHTML = '';
    document.getElementById('tree-view-container').style.display = 'block';

    draw(convert_cobweb_tree_to_draw_tree(root));
}

function execute_cobweb() {

    const table_headers_normalized = [];
    const table_rows_normalized = [];

    for (let i in table_values[0]) {
        table_headers_normalized.push(table_values[0][i].replaceAll(' ', '-').toLowerCase())
    }
    headers = table_headers_normalized;

    for (let i = 1; i < table_values.length; i++) {
        const table_row_normalized = [];

        for (let j in table_values[i]) {
            table_row_normalized.push(table_values[i][j].replaceAll(' ', '-').toLowerCase())
        }

        table_rows_normalized.push(table_row_normalized);
    }

    rows = table_rows_normalized;

    root = initialize_tree(headers, rows[0]);

    for (let i = 1; i < rows.length; i++) {
        cobweb(root, rows[i]);
    }

    render_tree();
}

render_table(table_values);