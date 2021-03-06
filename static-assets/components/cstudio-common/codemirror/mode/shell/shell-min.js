CodeMirror.defineMode("shell",function(a){var e={};
function g(l,h){var k=h.split(" ");
for(var j=0;
j<k.length;
j++){e[k[j]]=l
}}g("atom","true false");
g("keyword","if then do else elif while until for in esac fi fin fil done exit set unset export function");
g("builtin","ab awk bash beep cat cc cd chown chmod chroot clear cp curl cut diff echo find gawk gcc get git grep kill killall ln ls make mkdir openssl mv nc node npm ping ps restart rm rmdir sed service sh shopt shred source sort sleep ssh start stop su sudo tee telnet top touch vi vim wall wc wget who write yes zsh");
function f(l,j){var i=l.sol();
var h=l.next();
if(h==="'"||h==='"'||h==="`"){j.tokens.unshift(c(h));
return d(l,j)
}if(h==="#"){if(i&&l.eat("!")){l.skipToEnd();
return"meta"
}l.skipToEnd();
return"comment"
}if(h==="$"){j.tokens.unshift(b);
return d(l,j)
}if(h==="+"||h==="="){return"operator"
}if(h==="-"){l.eat("-");
l.eatWhile(/\w/);
return"attribute"
}if(/\d/.test(h)){l.eatWhile(/\d/);
if(!/\w/.test(l.peek())){return"number"
}}l.eatWhile(/\w/);
var k=l.current();
if(l.peek()==="="&&/\w+/.test(k)){return"def"
}return e.hasOwnProperty(k)?e[k]:null
}function c(h){return function(m,k){var j,i=false,l=false;
while((j=m.next())!=null){if(j===h&&!l){i=true;
break
}if(j==="$"&&!l&&h!=="'"){l=true;
m.backUp(1);
k.tokens.unshift(b);
break
}l=!l&&j==="\\"
}if(i||!l){k.tokens.shift()
}return(h==="`"||h===")"?"quote":"string")
}
}var b=function(k,i){if(i.tokens.length>1){k.eat("$")
}var h=k.next(),j=/\w/;
if(h==="{"){j=/[^}]/
}if(h==="("){i.tokens[0]=c(")");
return d(k,i)
}if(!/\d/.test(h)){k.eatWhile(j);
k.eat("}")
}i.tokens.shift();
return"def"
};
function d(i,h){return(h.tokens[0]||f)(i,h)
}return{startState:function(){return{tokens:[]}
},token:function(i,h){if(i.eatSpace()){return null
}return d(i,h)
}}
});
CodeMirror.defineMIME("text/x-sh","shell");