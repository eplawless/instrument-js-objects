var traverse  = require('traverse')
var fs        = require('fs')
var nomnom    = require('nomnom')
var esprima   = require('esprima')
var escodegen = require('escodegen')

function isInstrumentableExpression(astNode, contents) {
    switch (astNode.type) {
        case 'ArrayExpression':
        case 'ObjectExpression':
        case 'NewExpression':
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

function time(verbose, description, func) {
    if (verbose) {
        var startTime = Date.now()
        process.stderr.write(description + '... ')
    }
    var result = func()
    if (verbose) {
        process.stderr.write('Done (' + (Date.now()-startTime) + 'ms)\n')
    }
    return result
}

function rewriteFile(verbose, filename) {
    var filename = options.filename
    var buffer   = time(verbose, 'Loading file "' + filename + '"', function() {
        return fs.readFileSync(filename)
    })
    var contents = buffer.toString('utf-8')
    return rewrite(filename, contents, verbose)
}

function rewrite(filename, contents, verbose) {
    var listOfReplacements = [];
    var parseopts = { range: true, raw: true, loc: true }
    var ast = time(verbose, 'Parsing AST', function() {
        return esprima.parse(contents, parseopts)
    })

    ast = time(verbose, 'Rewriting AST', function() {
        return traverse(ast, function instrumentNode(astNode, ancestors) {
            if (!isInstrumentable(astNode, contents)) {
                return astNode
            }
            var range = astNode.range
            var line = astNode.loc.start.line
            var column = astNode.loc.start.column + 1
            var identifier = [filename,':',line,':',column].join('')
            var increaseCounter = '$_$count("'+identifier+'")'
            if (isInstrumentableExpression(astNode, contents)) {
                var prefix = '$_$tag('
                var postfix = ',"'+identifier+'")'
            } else if (isInstrumentableStatement(astNode, contents)) {
                var prefix = ''
                var postfix = ';'+increaseCounter+';'
            }
            listOfReplacements.push({ offset: range[0], value: prefix })
            listOfReplacements.push({ offset: range[1], value: postfix })
            return astNode
        })
    })

    if (listOfReplacements.length === 0) {
        return contents;
    }

    listOfReplacements = time(verbose, 'Sorting Results', function() {
        return listOfReplacements.sort(function(a, b) {
            return a.offset - b.offset
        })
    })

    var lastOffset = 0;
    var listOfSegments = [];
    return time(verbose, 'Making ' + listOfReplacements.length + ' Replacements', function() {
        listOfReplacements
            .forEach(function replace(replacement) {
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

        return "$_$=(typeof $_$==='object'?$_$:{});" +
            "$_$count=(typeof $_$count==='function'?$_$count:function(location){" +
                "$_$[location]=($_$[location]||0)+1;" +
            "});" +
            "$_$tag=(typeof $_$tag==='function'?$_$tag:function(val,location) {" +
                "$_$count(location);" +
                "Object.defineProperty(val,'__ALLOCATED_AT__',{" +
                    "enumerable: false," +
                    "configurable: false," +
                    "writable: false," +
                    "value: location" +
                "});return val" +
            "});" +
            "$_$memory=(typeof $_$memory==='object'?$_$memory:{" +
                "get allocations(){return $_$}," +
                "clear:function(){$_$={}}," +
                "top:function(num){" +
                    "return Object.keys($_$).sort(function(a,b) { " +
                        "return $_$[b]-$_$[a] " +
                    "}).slice(0,num).reduce(function(acc,a) {" +
                        "acc[a]=$_$[a];return acc" +
                    "},{}); " +
                "}," +
            "});" +
            listOfSegments.join('')
    })
}

var options = nomnom
    .option('filename', {
        abbr: 'f',
        required: true,
        help: 'File to traverse'
    })
    .option('verbose', {
        abbr: 'v',
        flag: true,
        help: 'Print status to stderr'
    })
    .parse()

var contents = rewriteFile(options.verbose, options.filename)
console.log(contents)
