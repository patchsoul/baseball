(function () { // create anonymous function
// BEGIN normal javascript
var calculator = document.getElementById("BaseCalculator");
if (!calculator)
    return;
var separator = '.';
var base = [
    // keep Decimal first
    { name : "Decimal", value : 10, characters : [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ], 
      lookup : { '0' : [0], '1': [1], '2' : [2], '3' : [3], '4' : [4], '5' : [5], '6' : [6], '7' : [7], '8' : [8], '9' : [9] } },
    { name : "Octal", value : 8, characters : [ '0', '1', '2', '3', '4', '5', '6', '7' ],
      lookup : { '0' : [0], '1': [1], '2' : [2], '3' : [3], '4' : [4], '5' : [5], '6' : [6], '7' : [7] } },
    { name : "Hexadecimal", value : 16, characters : [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ],
      lookup : { '0' : [0], '1': [1], '2' : [2], '3' : [3], '4' : [4], '5' : [5], '6' : [6], '7' : [7], '8' : [8], '9' : [9], 'a' : [10], 'b' : [11], 'c' : [12], 'd' : [13], 'e' : [14], 'f' : [15] } },
    { name : "Binary", value : 2, characters : [ '0', '1' ],
      lookup : { '0' : [0], '1': [1] } },
    { name : "Ternary", value : 3, characters : [ '0', '1', '2' ],
      lookup : { '0' : [0], '1': [1], '2' : [2] } },
    { name : "Dozenal", value : 12, characters : [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'N' ],
      lookup : { '0' : [0], '1': [1], '2' : [2], '3' : [3], '4' : [4], '5' : [5], '6' : [6], '7' : [7], '8' : [8], '9' : [9], 'X' : [10], 'N' : [11] } },
    { name : "Balanced Ternary", value : -1, characters : [ 'O', 'M', 'P' ],
      lookup : { 'O' : [0], 'M': [-1], 'P' : [1] } },
    { name : "Choose", value : 6, characters : [ '0', '1', '2', '3', '4', '5' ],
      lookup : { '0' : [0], '1': [1], '2' : [2], '3' : [3], '4' : [4], '5' : [5] } }
];
var DefaultCharacters = [ 
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '`', "'", '"', '!', '@', '$', '(', ')', '[', ']', '{', '}'
];
var help = document.getElementById("BaseCalculatorHelp");
if (help) {
    var element = document.createElement("details");
    var innerElement = document.createElement("summary");
    innerElement.innerHTML = "CHAOS: Calculator Help And Other Stuff"
    element.appendChild(innerElement);
    innerElement = document.createElement("div");
    innerElement.innerHTML = "<p>You can calculate things using postfix notation, e.g. "+
    "<pre> 3 4 /</pre> "+
    "Becomes 0.75, and so on.  The basic operators are: "+
    "<pre> * / - +</pre> "+
    "Though a minus sign (-) preceding a valid number becomes a unary minus "+
    "(negating that number).  Look at the stack box for what's going on internally with the calculator.</p>"+
    "<p>More complicated operators: "+
    "<pre> ^ _ ~</pre> "+
    "The caret <code>^</code> is exponentiation, not binary XOR (<code>3 4 ^</code> gives 81, not 7), "+
    "and the underscore <code>_</code> is a base-specified logarithm (<code>3 4 _</code> gives 1.26, i.e., <code>3 1.26 ^</code> gives 4).  Finally, "+
    "<code>~</code> swaps the top two elements on the stack.</p>"+
    "<p>Balanced numbers are given with a negative base in the Choose&rarr;Base input "+
    "(providing the largest-magnitude negative digit, though the actual base is one "+
    "minus twice that), with negative character digits given by the odd indices, "+
    "e.g., <code>0, -1, 1, -2, 2</code> for a \"Base -2\" (actually Balanced Base 5).  "+
    "As a complete example, the default balanced ternary "+
    "characters are <code>O, M, P</code>, corresponding to 0, -1, and 1 digits.</p>"+
    "<p>Special numbers:  <code>Ctrl+e</code> to input e=2.71828, "+
    "and <code>Ctrl+p</code> to input pi=3.14159.</p>"+
    "<p>Also beware of roundoff error; numbers are stored in floating point format, "+
    "so the lowest digits might be telephone numbers.  For example, "+
    "typing in 0.75 into the decimal input will give you an inexact representation "+
    "(due to how the conversion is performed), but typing 0.11 into the binary input "+
    "will give you the exact representation (or use <code>3 4 /</code>).</p>"+
    "<p>Report bugs <a href=\"https://github.com/patchsoul/baseball/issues\">here</a> "+
    "or drop me a line.  Round-off error is not a bug. "+
    "Check the console for helpful information.</p>"
    element.appendChild(innerElement);
    help.append(element);
}
var stack = [];
var StackDiv = document.getElementById("BaseCalculatorStack");
function add_message(text, style) {
    if (!StackDiv) return;
    var newcode = document.createElement("pre");
    newcode.className = style;
    newcode.innerHTML = text;
    StackDiv.appendChild(newcode);
}
function error(msg) {
    console.error(msg);
    add_message(msg, "stackError");
}
function stack_alert(msg) {
    if (msg)
        msg = "stack: ["+stack.join(" ")+"] after "+msg;
    else
        msg = "stack: ["+stack.join(" ")+"]";
    console.log(msg);
    add_message(msg, "stackNormal");
}
var Operators = {
    '*' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 *\").");
        stack[stack.length-2] *= stack[stack.length-1];
        stack.pop();
        stack_alert("*");
    },
    '/' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 /\").");
        stack[stack.length-2] /= stack[stack.length-1];
        stack.pop();
        stack_alert("/");
    },
    '+' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 +\").");
        stack[stack.length-2] += stack[stack.length-1];
        stack.pop();
        stack_alert("+");
    },
    '-' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 -\").");
        stack[stack.length-2] -= stack[stack.length-1];
        stack.pop();
        stack_alert("-");
    },
    '^' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 ^\").");
        stack[stack.length-2] = Math.pow(stack[stack.length-2], stack[stack.length-1]);
        stack.pop();
        stack_alert("^");
    },
    '_' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 _\").");
        stack[stack.length-2] = Math.log(stack[stack.length-1]) / Math.log(stack[stack.length-2]);
        stack.pop();
        stack_alert("_");
    },
    '~' : function () {
        if (stack.length <= 1)
            return error("Not enough numbers on stack, this is POSTFIX (use \"3 4 ~\").");
        var swap = stack[stack.length-2];
        stack[stack.length-2] = stack[stack.length-1];
        stack[stack.length-1] = swap;
        // don't pop here
        stack_alert("~");
    },
};
function calculate(msg, i) {
    stack.length = 0;
    if (StackDiv) {
        while (StackDiv.lastChild)
            StackDiv.removeChild(StackDiv.lastChild);
    }
    if (base[i].value < 0)
        add_message("calculating input '"+msg+"' with balanced base "+(1-2*base[i].value), "stackNormal");
    else
        add_message("calculating input '"+msg+"' with base "+base[i].value, "stackNormal");
    var jstart = 0;
    var j = 0;
    while (j < msg.length) {
        if (msg[j] == ' ') {
            ++j;
            jstart = j;
            continue;
        }
        var sign = 1;
        if ((msg[j] == '-') && (j+1 < msg.length) && (msg[j+1] == separator || base[i].lookup[msg[j+1]] !== undefined)) {
            sign = -1; 
            ++j;
        }
        if (msg[j] == separator || base[i].lookup[msg[j]] !== undefined) {
            // build the result, we got a digit
            var baseMultiple = base[i].value < 0 ? 1-2*base[i].value : base[i].value;
            var result;
            if (msg[j] == separator) {
                result = 0;
                ++j;
            } else {
                result = base[i].lookup[msg[j]][Math.floor(Math.random()*base[i].lookup[msg[j]].length)];
                ++j;
                while (j < msg.length && base[i].lookup[msg[j]] !== undefined) {
                    result *= baseMultiple;
                    result += base[i].lookup[msg[j]][Math.floor(Math.random()*base[i].lookup[msg[j]].length)];
                    ++j;
                }
                if (j >= msg.length || msg[j] != separator) {
                    stack.push(result*sign);
                    stack_alert(msg.substring(jstart, j));
                    jstart = j;
                    continue;
                }
                // otherwise, we have a period, so go past that
                ++j;
            }
            var below = 1.0;
            while (j < msg.length && base[i].lookup[msg[j]] !== undefined) {
                below /= baseMultiple;
                result += base[i].lookup[msg[j]][Math.floor(Math.random()*base[i].lookup[msg[j]].length)]*below;
                ++j;
            }
            stack.push(result*sign);
            stack_alert(msg.substring(jstart, j));
            jstart = j;
        } else  {
            var fn = Operators[msg[j]];
            if (fn === undefined) {
                error("unknown character: "+msg[j]);
                ++j;
                jstart = j;
                continue;
            }
            fn();
            ++j;
        }
    }
}
function bufferBalanced(i, copy) {
    var buffer = [];
    var baseMultiple = 1 - base[i].value*2;
    while (copy) {
        var sign = (copy < 0) ? -1 : 1;
        var absval = sign*copy;
        if (absval > -base[i].value) {
            var div = Math.floor(absval / baseMultiple); // divide
            var digit = absval % baseMultiple; // remainder
            if (digit > -base[i].value) { // digit too big
                ++div; // carry it up stream
                digit -= baseMultiple;
            }
            copy = sign*div;
            absval = sign*digit;
            if (absval < 0)
                buffer.push(base[i].characters[-2*absval-1]);
            else
                buffer.push(base[i].characters[2*absval]);
        } else { // we're finished here...
            buffer.push(base[i].characters[2*absval+(sign-1)/2]);
            copy = 0;
        }
    }
    return buffer.reverse();
}

function write(i, value) {
    var buffer = [];
    if (value == 0) {
        buffer.push(base[i].characters[0]);
    } else if (base[i].value < 0) { // balanced
        var baseMultiple = 1 - base[i].value*2;
        var rounded = Math.round(value);
        buffer = bufferBalanced(i, Math.round(value));
        if (value-rounded) {
            var length = buffer.length;
            var maxBuffer = 39/Math.log(baseMultiple);
            var maxShift = maxBuffer - length;
            if (maxShift > 0) {
                var shift = 0;
                for (; shift < maxShift; ++shift) {
                    value *= baseMultiple;
                    if (Math.round(value) == value) {
                        break;
                    }
                }
                buffer = bufferBalanced(i, Math.round(value));
                buffer.splice(length, 0, '.');
            } else {
                buffer.push('.'); 
            }
        }
    } else { // normal
        if (value < 0) {
            buffer.push('-');
            value *= -1;
        }
        var copy = Math.floor(value);
        while (copy > 0) {
            buffer.push('?');
            copy = Math.floor(copy / base[i].value);
        }
        var j = buffer.length;
        copy = Math.floor(value);
        value -= copy;
        while (copy > 0) {
            buffer[--j] = base[i].characters[copy % base[i].value];
            copy = Math.floor(copy / base[i].value);
        }
        if (value) {
            if (buffer.length == 0 || (buffer.length == 1 && buffer[0] == '-'))
                buffer.push(base[i].characters[0]);
            buffer.push('.');
            var maxBuffer = 39/Math.log(base[i].value);
            while (value && buffer.length < maxBuffer) {
                value *= base[i].value;
                var digit = Math.floor(value);
                buffer.push(base[i].characters[digit]);
                value -= digit;
            }
        }
    }
    return buffer.join("");
}
function newCharacterInput(i, j) {
    var input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.className = "character";
    if (j >= base[i].characters.length) {
        input.value = DefaultCharacters[j];
    } else {
        input.value = base[i].characters[j]
    }
    input.onblur = function () {
        var v = input.value[0];
        if (Operators[v] !== undefined) {
            error("Don't use an operator */+- to define a character.");
            v = DefaultCharacters[j];
        }
        if (j >= base[i].characters.length) {
            while (base[i].characters.length < j) {
                base[i].characters.push(DefaultCharacters[base[i].characters.length]);
            }
            base[i].characters.push(v);
        } else {
            base[i].characters[j] = v;
        }
        base[i].lookup = {};
        var baseMultiple;
        if (base[i].value < 0) {
            base[i].lookup[base[i].characters[0]] = [0];
            for (var k=1; k <= -base[i].value; ++k) {
                if (base[i].lookup[base[i].characters[2*k-1]] === undefined)
                    base[i].lookup[base[i].characters[2*k-1]] = [-k];
                else {
                    base[i].lookup[base[i].characters[2*k-1]].push(-k);
                    error("multiple values for character "+base[i].characters[2*k-1]+": "+base[i].lookup[base[i].characters[2*k-1]]);
                }
                if (base[i].lookup[base[i].characters[2*k]] === undefined)
                    base[i].lookup[base[i].characters[2*k]] = [k];
                else {
                    base[i].lookup[base[i].characters[2*k]].push(k);
                    error("multiple values for character "+base[i].characters[2*k] +": "+ base[i].lookup[base[i].characters[2*k]]);
                }
            }
        } else {
            for (var k=0; k < base[i].value; ++k) {
                if (base[i].lookup[base[i].characters[k]] === undefined)
                    base[i].lookup[base[i].characters[k]] = [k];
                else {
                    base[i].lookup[base[i].characters[k]].push(k);
                    error("multiple values for character "+ base[i].characters[k] +": "+ base[i].lookup[base[i].characters[k]]);
                }
            }
        }
    }
    return input;
}
function newBaseInput(i) {
    var div = document.createElement("div");
    div.className = "base";
    if (base[i].value == 0 || base[i].value == 1) {
        error("bad base, need base < 0 or base > 1");
        return div;     
    }
    var label = document.createElement("label");
    var input = document.createElement("input");
    input.type = "text";
    input.value = "";
    input.className = "number";
    label.innerHTML = base[i].name + ":";
    input.id = label.for = "Input"+base[i].name;
    input.baseIndex = i;
    input.onblur = function () { 
        calculate(this.value, i); 
        if (stack.length === 0) {
            error("nothing in the stack.");
            return;
        } else if (stack.length > 1) {
            error("more than one thing left in the stack, taking last element.");
        }
        var value = stack[stack.length-1];
        console.log("writing value", value, "to all");
        for (var j=0; j<base.length; ++j) {
            document.getElementById("Input"+base[j].name).value = write(j, value);
        }
    };
    div.appendChild(label);
    div.appendChild(input);
    var characters = document.createElement("div");
    var count = base[i].value < 0 ? 1-2*base[i].value : base[i].value;
    for (var j=0; j<count; ++j) {
        characters.appendChild(newCharacterInput(i, j));
    }
    if (base[i].name === "Choose") {
        label = document.createElement("label");
        label.for = "ChooseBase";
        label.innerHTML = "Base:&nbsp;&nbsp;";
        var input2 = document.createElement("input");
        input2.type = "text";
        input2.maxLength = 2;
        input2.id = "ChooseBase";
        input2.value = base[i].value;
        input2.onblur = function () {
            var val = parseInt(input2.value);
            if (isNaN(val) || val == 0 || val == 1) {
                error("bad base value (pick < 0 for balanced, or > 1 for regular)");
                input2.value = base[i].value;
                return;
            }
            if (val > DefaultCharacters.length) {
                input2.value = val = DefaultCharacters.length;
            }
            var count = val < 0 ? 1-2*val : val;
            var oldCount = base[i].value < 0 ? 1-2*base[i].value : base[i].value;
            var diff = count - oldCount;
            base[i].value = val;
            if (diff === 0) {
                return;
            } else if (diff < 0) {
                while (diff < 0) {
                    characters.removeChild(characters.lastChild);
                    ++diff;
                }
            } else {
                while (diff > 0) {
                    characters.appendChild(newCharacterInput(i, oldCount));
                    ++oldCount;
                    --diff;
                }
            }
            // update ChooseInput by writing TOS there, if it exists
            if (stack.length) {
                input.value = write(i, stack[stack.length-1]);
            }
        }
        div.appendChild(label);
        div.appendChild(input2);
    }
    div.append(characters);
    return div;
}
function insertTextAtCursor(element, text) {
    console.log("sel start", element.selectionStart);
    console.log("sel end", element.selectionEnd);
    if (element.selectionStart !== undefined && element.selectionEnd !== undefined) {
        var newtext = [ element.value.substring(0, element.selectionStart), "", text, "",
            element.value.substring(element.selectionEnd) ]
        if (newtext[0].length && newtext[0][newtext[0].length-1] != " ")
            newtext[1] = " ";
        if (newtext[4].length && newtext[4][newtext[4].length-1] != " ")
            newtext[3] = " ";
        element.value = newtext.join("");
    } else {
        if (element.value)
            element.value += " ";
        element.value += text;
    }
}
document.onkeydown = function(evt) {
  if (evt.keyCode == 27) {
    document.activeElement.blur(); // defocus from current element
  } else if (evt.keyCode == 13) { // if we press enter...
    // don't let enter execute submit
    evt.preventDefault();
    var active = document.activeElement;
    active.blur(); // defocus from current element
    active.focus(); // refocus
    return false;
  } else if (evt.ctrlKey) {
    var active = document.activeElement;
    if (evt.key == "e") {
        evt.preventDefault();
        if (active.baseIndex !== undefined) {
            insertTextAtCursor(active, write(active.baseIndex, Math.E));
        }
    } else if (evt.key == "p") {
        evt.preventDefault();
        if (active.baseIndex !== undefined) {
            insertTextAtCursor(active, write(active.baseIndex, Math.PI));
        }
    }
  }
};
// finally, this creates the calculator
for (var i=0; i<base.length; ++i) {
    calculator.appendChild(newBaseInput(i));
}
// END
})() // function enclosure
