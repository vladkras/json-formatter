function $id(id){ return document.getElementById(id); }

function Process() {

    window.IsCollapsible = true;
    var json = $id("raw-json").value;
    var canvas = document.createElement('div');
    canvas.id = "Canvas";
    canvas.setAttribute('class', 'Canvas');
    $id("raw-json").parentNode.insertBefore(canvas, $id("raw-json"));

    try{
        if(json == "") json = "\"\"";
        var obj = eval("["+json+"]");
        var html = ProcessObject(obj[0], 0, false, false, false);
        $id("raw-json").style.display = 'none';
        canvas.innerHTML = "<pre>"+html+"</pre>";
    }catch(e){
        alert("JSON is not well formated:\n"+e.message);
    }
}
window._dateObj = new Date();
window._regexpObj = new RegExp();
function ProcessObject(obj, indent, addComma, isArray, isPropertyContent){
    var html = "";
    if (!indent && Array.isArray(obj)) {
        html = "<span class=\"MainArr\">\"data[" + obj.length + "]\"</span>:";
    }
    var comma = (addComma) ? "<span class='Comma'>,</span> " : "";
    var type = typeof obj;
    var clpsHtml ="";
    if(Array.isArray(obj)){
        if(obj.length == 0){
            html += GetRow(indent, "<span class='ArrayBrace'>[]</span>"+comma, isPropertyContent);
        }else{
            clpsHtml = window.IsCollapsible ? "<span><span class=\"glyphicon glyphicon-minus\" onClick=\"ExpClicked(this)\"></span></span><span class='collapsible'>" : "";
            html += GetRow(indent, "<span class='ArrayBrace'>[</span>"+clpsHtml, isPropertyContent);
            for(var i = 0; i < obj.length; i++){
                html += ProcessObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
            }
            clpsHtml = window.IsCollapsible ? "</span>" : "";
            html += GetRow(indent, clpsHtml+"<span class='ArrayBrace'>]</span>"+comma);
        }
    }else if(type == 'object'){
        if (obj == null){
            html += FormatLiteral("null", "", comma, indent, isArray, "Null");
        }else if (obj.constructor == window._dateObj.constructor) {
            html += FormatLiteral("new Date(" + obj.getTime() + ") /*" + obj.toLocaleString()+"*/", "", comma, indent, isArray, "Date");
        }else if (obj.constructor == window._regexpObj.constructor) {
            html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp");
        }else{
            var numProps = 0;
            for(var prop in obj) numProps++;
            if(numProps == 0){
                html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>"+comma, isPropertyContent);
            }else{
                clpsHtml = window.IsCollapsible ? "<span><span class=\"glyphicon glyphicon-minus\" onClick=\"ExpClicked(this)\"></span></span><span class='collapsible'>" : "";
                html += GetRow(indent, "<span class='ObjectBrace'>{</span>"+clpsHtml, isPropertyContent);
                var j = 0;
                for(var prop in obj){
                    var quote = "\"";
                    var arrLength = Array.isArray(obj[prop]) ? "["+obj[prop].length+"]" : "";

                    html += GetRow(indent + 1, "<span class='PropertyName'>"+quote+prop+arrLength+quote+"</span>: "+ProcessObject(obj[prop], indent + 1, ++j < numProps, false, true));
                }
                clpsHtml = window.IsCollapsible ? "</span>" : "";
                html += GetRow(indent, clpsHtml+"<span class='ObjectBrace'>}</span>"+comma);
            }
        }
    }else if(type == 'number'){
        html += FormatLiteral(obj, "", comma, indent, isArray, "Number");
    }else if(type == 'boolean'){
        html += FormatLiteral(obj, "", comma, indent, isArray, "Boolean");
    }else if(type == 'function'){
        if (obj.constructor == window._regexpObj.constructor) {
            html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp");
        }else{
            obj = FormatFunction(indent, obj);
            html += FormatLiteral(obj, "", comma, indent, isArray, "Function");
        }
    }else if(type == 'undefined'){
        html += FormatLiteral("undefined", "", comma, indent, isArray, "Null");
    }else{
        html += FormatLiteral(obj.toString().split("\\").join("\\\\").split('"').join('\\"'), "\"", comma, indent, isArray, "String");
    }
    return html;
}

function FormatLiteral(literal, quote, comma, indent, isArray, style){
    if(typeof literal == 'string')
    literal = literal.split("<").join("&lt;").split(">").join("&gt;");
    var str = "<span class='"+style+"'>"+quote+literal+quote+comma+"</span>";
    if(isArray) str = GetRow(indent, str);
    return str;
}

function FormatFunction(indent, obj){
    var tabs = "";
    for(var i = 0; i < indent; i++) tabs += '    ';
    var funcStrArray = obj.toString().split("\n");
    var str = "";
    for(var i = 0; i < funcStrArray.length; i++){
        str += ((i==0)?"":tabs) + funcStrArray[i] + "\n";
    }
    return str;
}

function GetRow(indent, data, isPropertyContent){
    var tabs = "";
    for(var i = 0; i < indent && !isPropertyContent; i++) tabs += '    ';
    if(data != null && data.length > 0 && data.charAt(data.length-1) != "\n")
    data = data+"\n";
    return tabs+data;
}

function TraverseChildren(element, func, depth){
    for(var i = 0; i < element.childNodes.length; i++){
        TraverseChildren(element.childNodes[i], func, depth + 1);
    }
    func(element, depth);
}

function ExpClicked(sign){
    var container = sign.parentNode.nextSibling;
    if(!container) return;
    var disp = "none";

    if(container.style.display == "none"){
        disp = "inline";
        sign.classList.remove('glyphicon-plus');
        sign.classList.add('glyphicon-minus');
    } else {
        sign.classList.remove('glyphicon-minus');
        sign.classList.add('glyphicon-plus');
    }
    container.style.display = disp;

}
