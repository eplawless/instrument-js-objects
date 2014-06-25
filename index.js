var traverse  = require('traverse')
var fs        = require('fs')
var nomnom    = require('nomnom')
var esprima   = require('esprima')
var escodegen = require('escodegen')

function isInstrumentableExpression(astNode, contents) {
    switch (astNode.type) {
        case 'ArrayExpression':
        case 'ObjectExpression':
            return true
        case 'FunctionExpression':
            var isFalsePositive = contents[astNode.range[0]] === '{'
            return !isFalsePositive
        default:
            return false
    }
}

function isInstrumentableStatement(astNode, contents) {
    return astNode.type === 'FunctionDeclaration'
}

function isInstrumentable(astNode, contents) {
    return isInstrumentableExpression(astNode, contents) || isInstrumentableStatement(astNode, contents)
}

function splice(str, idxBegin, idxEnd, add) {
    return str.slice(0, idxBegin) + add + str.slice(idxEnd);
}

function time(description, func) {
    var startTime = Date.now()
    process.stderr.write(description + '... ')
    var result = func()
    process.stderr.write('Done (' + (Date.now()-startTime) + 'ms)\n')
    return result
}

function rewriteFile(filename) {
    var filename = options.filename
    var buffer   = time('Loading file "' + filename + '"', function() {
        return fs.readFileSync(filename)
    })
    var contents = buffer.toString('utf-8')
    return rewrite(filename, contents)
}

function rewrite(filename, contents) {
    var listOfReplacements = [];
    var parseopts = { range: true, raw: true, loc: true }
    var ast = time('Parsing AST', function() {
        return esprima.parse(contents, parseopts)
    })

    ast = time('Rewriting AST', function() {
        return traverse(ast, function instrumentNode(astNode, ancestors) {
            if (!isInstrumentable(astNode, contents)) {
                return astNode
            }
            var range = astNode.range
            var line = astNode.loc.start.line
            var column = astNode.loc.start.column + 1
            var text = contents.substring(range[0], range[1])
            var identifier = [filename,':',line,':',column].join('')
            var increaseCounter = '$_$["'+identifier+'"]=($_$["'+identifier+'"]||0)+1'
            var ancestorNodes = ancestors.filter(isInstrumentable)
            if (isInstrumentableExpression(astNode, contents)) {
                var prefix = '('+increaseCounter+','
                var postfix = ')'
            } else if (isInstrumentableStatement(astNode, contents)) {
                var prefix = ''
                var postfix = increaseCounter+';'
            }
            var replacement = {
                node: astNode,
                ancestors: ancestorNodes,
            };
            var insertPrefix = Object.create(replacement)
            var insertPostfix = Object.create(replacement)
            insertPrefix.offset = range[0]
            insertPrefix.value = prefix
            insertPostfix.offset = range[1]
            insertPostfix.value = postfix
            listOfReplacements.push(insertPrefix)
            listOfReplacements.push(insertPostfix)
            return astNode
        })
    })

    if (listOfReplacements.length === 0) {
        return contents;
    }

    listOfReplacements = time('Sorting Results', function() {
        return listOfReplacements.sort(function(a, b) {
            return a.offset - b.offset
        })
    })

    var lastOffset = 0;
    var listOfSegments = [];
    time('Making ' + listOfReplacements.length + ' Replacements', function() {
        listOfReplacements
            .forEach(function replace(replacement) {
                var node = replacement.node
                var value = replacement.value
                var offset = replacement.offset
                var segment = contents.substring(lastOffset, offset)
                if (segment) {
                    listOfSegments.push(segment)
                }
                listOfSegments.push(value)
                lastOffset = offset
            })
        var lastSegment = contents.substring(lastOffset, contents.length)
        if (lastSegment) {
            listOfSegments.push(lastSegment)
        }
    })

    return "$_$=(typeof $_$==='object'?$_$:{});" +
        "$___memory=(typeof $___memory==='object'?$___memory:{allocations:$_$,top:function(num) {" +
            "return Object.keys($_$).sort(function(a,b) { " +
                "return $_$[b]-$_$[a] " +
            "}).slice(0,num).reduce(function(acc,a) {" +
                "acc[a]=$_$[a];return acc" +
            "},{}); " +
        "}});" +
        listOfSegments.join('')
}

var options = nomnom
    .option('filename', {
        abbr: 'f',
        required: true,
        help: 'File to traverse'
    })
    .parse()

var contents = rewriteFile(options.filename)
console.log(contents)

