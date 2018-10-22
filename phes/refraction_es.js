// Reflexion und Brechung von Licht, spanische Texte (Juan Munoz)
// Letzte Änderung 14.12.2017

// Texte in HTML-Schreibweise:
    
var text01 = "1. &Iacute;ndice de Refracci&oacute;n:";
var text02 = "2. &Iacute;ndice de Refracci&oacute;n:";
var text03 = "&Aacute;ngulo de Incidencia:";
var text04 = "&Aacute;ngulo de Reflexi&oacute;n:";
var text05 = "&Aacute;ngulo de Refracci&oacute;n:";    
var text06 = ["&Aacute;ngulo M&iacute;nimo para", "Reflexi&oacute;n Total Interna:"];

var author = "W. Fendt 1997,&nbsp; J. Mu&ntilde;oz 1999";

// Symbole und Einheiten:

var decimalSeparator = ",";                                // Dezimaltrennzeichen (Komma/Punkt)
var degree = "&deg;";                                      // Grad

// Texte in Unicode-Schreibweise:

var text07 = [["vac\u00edo", "1"], ["aire", "1.0003"],     // Stoffe und Brechungsindizes
    ["agua", "1.33"], ["etanol", "1.36"],
    ["cuarzo", "1.46"], ["benceno", "1.49"], 
    ["vidrio crown N-K5", "1.52"], ["sal rocosa", "1.54"], 
    ["vidrio flint LF5", "1.58"], ["vidrio crown N-SK4", "1.61"],
    ["vidrio flint SF6", "1.81"], ["diamante", "2.42"],
    ["", ""]];
    
// Symbole und Einheiten: 

var symbolAngle1 = "\u03b5";                               // Symbol für Einfallswinkel (Epsilon)
var symbolAngle2 = "\u03b5'";                              // Symbol für Brechungswinkel (Epsilon Strich)
var degreeUnicode = "\u00b0";                              // Grad
