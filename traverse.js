function icombinator(x) { return x; }

function traverse(ast, visitor, arrAncestors) {
    if (!ast) { return; }
    arrAncestors = arrAncestors || [];
    visitor = visitor || icombinator;

    ast = visitor(ast, arrAncestors);

    arrAncestors.push(ast);

    switch (ast.type) {
        case 'BlockStatement':
        case 'Program':
        case 'ClassBody':
            for (var idx = 0; idx < ast.body.length; ++idx) {
                ast.body[idx] = traverse(ast.body[idx], visitor, arrAncestors);
            }
            break;
        case 'ExpressionStatement':
            ast.expression = traverse(ast.expression, visitor, arrAncestors);
            break;
        case 'ConditionalExpression':
        case 'IfStatement':
            ast.test = traverse(ast.test, visitor, arrAncestors);
            ast.consequent = traverse(ast.consequent, visitor, arrAncestors);
            ast.alternate = traverse(ast.alternate, visitor, arrAncestors);
            break;
        case 'VariableDeclaration':
            for (var idx = 0; idx < ast.declarations.length; ++idx) {
                ast.declarations[idx] = traverse(ast.declarations[idx], visitor, arrAncestors);
            }
            break;
        case 'VariableDeclarator':
            ast.id = traverse(ast.id, visitor, arrAncestors);
            ast.init = traverse(ast.init, visitor, arrAncestors);
            break;
        case 'LogicalExpression':
        case 'AssignmentExpression':
        case 'BinaryExpression':
        case 'ComprehensionBlock':
            ast.left = traverse(ast.left, visitor, arrAncestors);
            ast.right = traverse(ast.right, visitor, arrAncestors);
            break;
        case 'WhileStatement':
        case 'DoWhileStatement':
            ast.test = traverse(ast.test, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'ObjectExpression':
            for (var idx = 0; idx < ast.properties.length; ++idx) {
                ast.properties[idx].value = traverse(ast.properties[idx].value, visitor, arrAncestors);
            }
            break;
        case 'Property':
            ast.key = traverse(ast.key, visitor, arrAncestors);
            ast.value = traverse(ast.value, visitor, arrAncestors);
            break;
        case 'FunctionDeclaration':
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
            for (var idx = 0; idx < ast.params.length; ++idx) {
                ast.params[idx] = traverse(ast.params[idx], visitor, arrAncestors);
            }
            for (var idx = 0; idx < ast.defaults.length; ++idx) {
                ast.defaults[idx] = traverse(ast.defaults[idx], visitor, arrAncestors);
            }
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'LabeledStatement':
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'WithStatement':
            ast.object = traverse(ast.object, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'SwitchStatement':
            ast.discriminant = traverse(ast.discriminant, visitor, arrAncestors);
            for (var idx = 0; idx < ast.cases.length; ++idx) {
                ast.cases[idx] = traverse(ast.cases[idx], visitor, arrAncestors);
            }
            break;
        case 'SwitchCase':
            ast.test = traverse(ast.test, visitor, arrAncestors);
            for (var idx = 0; idx < ast.consequent.length; ++idx) {
                ast.consequent[idx] = traverse(ast.consequent[idx], visitor, arrAncestors);
            }
            break;
        case 'TryStatement':
            ast.block = traverse(ast.block, visitor, arrAncestors);
            ast.handler = traverse(ast.handler, visitor, arrAncestors);
            for (var idx = 0; idx < ast.guardedHandlers.length; ++idx) {
                ast.guardedHandlers[idx] = traverse(ast.guardedHandlers[idx], visitor, arrAncestors);
            }
            ast.finalizer = traverse(ast.finalizer, visitor, arrAncestors);
            break;
        case 'ForStatement':
            ast.init = traverse(ast.init, visitor, arrAncestors);
            ast.test = traverse(ast.test, visitor, arrAncestors);
            ast.update = traverse(ast.update, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'ForInStatement':
        case 'ForOfStatement':
            ast.left = traverse(ast.left, visitor, arrAncestors);
            ast.right = traverse(ast.right, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'LetStatement':
        case 'LetExpression':
            for (var idx = 0; idx < ast.head.length; ++idx) {
                ast.head[idx].id = traverse(ast.head[idx].id, visitor, arrAncestors);
                ast.head[idx].init = traverse(ast.head[idx].init, visitor, arrAncestors);
            }
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'ArrayExpression':
            for (var idx = 0; idx < ast.elements.length; ++idx) {
                ast.elements[idx] = traverse(ast.elements[idx], visitor, arrAncestors);
            }
            break;
        case 'SequenceExpression':
            for (var idx = 0; idx < ast.expressions.length; ++idx) {
                ast.expressions[idx] = traverse(ast.expressions[idx], visitor, arrAncestors);
            }
            break;
        case 'YieldExpression':
        case 'UpdateExpression':
        case 'ThrowStatement':
        case 'UnaryExpression':
        case 'ReturnStatement':
        case 'AwaitExpression':
        case 'SpreadElement':
            ast.argument = traverse(ast.argument, visitor, arrAncestors);
            break;
        case 'NewExpression':
        case 'CallExpression':
            ast.callee = traverse(ast.callee, visitor, arrAncestors);
            for (var idx = 0; idx < ast.arguments.length; ++idx) {
                ast.arguments[idx] = traverse(ast.arguments[idx], visitor, arrAncestors);
            }
            break;
        case 'MemberExpression':
            ast.object = traverse(ast.object, visitor, arrAncestors);
            ast.property = traverse(ast.property, visitor, arrAncestors);
            break;
        case 'GeneratorExpression':
        case 'ComprehensionExpression':
            ast.body = traverse(ast.body, visitor, arrAncestors);
            for (var idx = 0; idx < ast.blocks.length; ++idx) {
                ast.blocks[idx] = traverse(ast.blocks[idx], visitor, arrAncestors);
            }
            ast.filter = traverse(ast.filter, visitor, arrAncestors);
            break;
        case 'ObjectPattern':
            for (var idx = 0; idx < ast.properties.length; ++idx) {
                ast.properties[idx].key = traverse(ast.properties[idx].key, visitor, arrAncestors);
                ast.properties[idx].value = traverse(ast.properties[idx].value, visitor, arrAncestors);
            }
            break;
        case 'ArrayPattern':
            for (var idx = 0; idx < ast.elements.length; ++idx) {
                ast.elements[idx] = traverse(ast.elements[idx], visitor, arrAncestors);
            }
            break;
        case 'CatchClause':
            ast.param = traverse(ast.param, visitor, arrAncestors);
            ast.guard = traverse(ast.guard, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'ClassDeclaration':
        case 'ClassExpression':
            ast.superClass = traverse(ast.superClass, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'ExportDeclaration':
            ast.declaration = traverse(ast.declaration, visitor, arrAncestors);
            for (var idx = 0; idx < ast.specifiers.length; ++idx) {
                ast.specifiers[idx] = traverse(ast.specifiers[idx], visitor, arrAncestors);
            }
            ast.source = traverse(ast.source, visitor, arrAncestors);
            break;
        case 'ExportSpecifier':
        case 'ImportSpecifier':
            ast.id = traverse(ast.id, visitor, arrAncestors);
            break;
        case 'ImportDeclaration':
            for (var idx = 0; idx < ast.specifiers.length; ++idx) {
                ast.specifiers[idx] = traverse(ast.specifiers[idx], visitor, arrAncestors);
            }
            ast.source = traverse(ast.source, visitor, arrAncestors);
            break;
        case 'MethodDefinition':
            ast.key = traverse(ast.key, visitor, arrAncestors);
            ast.value = traverse(ast.value, visitor, arrAncestors);
            break;
        case 'ModuleDeclaration':
            ast.id = traverse(ast.id, visitor, arrAncestors);
            ast.source = traverse(ast.source, visitor, arrAncestors);
            ast.body = traverse(ast.body, visitor, arrAncestors);
            break;
        case 'TaggedTemplateExpression':
            ast.tag = traverse(ast.tag, visitor, arrAncestors);
            ast.quasi = traverse(ast.quasi, visitor, arrAncestors);
            break;
        case 'TemplateElement':
            ast.value.raw = traverse(ast.value.raw, visitor, arrAncestors);
            ast.value.cooked = traverse(ast.value.cooked, visitor, arrAncestors);
            ast.tail = traverse(ast.tail, visitor, arrAncestors);
            break;
        case 'TemplateLiteral':
            for (var idx = 0; idx < ast.quasis.length; ++idx) {
                ast.quasis[idx] = traverse(ast.quasis[idx], visitor, arrAncestors);
            }
            for (var idx = 0; idx < ast.expressions.length; ++idx) {
                ast.expressions[idx] = traverse(ast.expressions[idx], visitor, arrAncestors);
            }
            break;

        case 'ThisExpression':
        case 'DebuggerStatement':
        case 'ContinueStatement':
        case 'BreakStatement':
        case 'Identifier':
        case 'Literal':
        case 'ClassHeritage':
        case 'EmptyStatement':
        case 'ExportBatchSpecifier':
        default:
            break;
    }

    arrAncestors.pop();

    return ast;
}

module.exports = traverse;

