When creating a Surveyfile there are some very important aspects to note!
First: If "Zeige Extra Img" is set true then it will be shown in the Timer in Module:"OPTIK T1 IME" or "HAPTIK T1 IME" and part:"OPTIK T1 IME Präsentation" or "HAPTIK T1 IME Präsentation".
Second: If Module is "T0 MN" and part is "Material Narrativ" with the text:"LOAD" then the text will be replaced with the Material Information
Third: In module "POI", part:"Demographie", options:"LOAD", name:"POI_Demographie_origin" or "POI_Demographie_residence" the countrynames will automatically be loaded

The names of the unique modules/parts, that wont be repeated when having multiple materials are:
                ["POI", "Intro", "Einleitung", "Training", "Prä_Stimmungsabfrage", "Post_Stimmungsabfrage", "Outro",
                "POI Intro","POI Einleitung","POI Forschungsgegenstand", "POI Einverständniserklärung", "Start", "Demographie", "Milieu Identifikation", "Normative Grundorientierung",
                "Allgemeines Konsumverhalten", "Markenvertrauen", "Markenvertrauen_VW", "Markenvertrauen_Audi", "Markenvertrauen_Fiat", "Markenvertrauen_H&M",
                "Markenvertrauen_Patagonia" ,"Markenvertrauen_Vaude", "NPIS: Need for product information seeking", "SFOC: Slow fashion orientation construct",
                "NEP: New Ecological Paradigm Scale", "BFI-10: 10 Item Big Five Inventory", " (Tavassoli et al., 2014)", "POI Outro", "Information Messsequenz",
                "Datenanonymisierung", "Einverständniserklärung", "Information Sicherheit", "Information Trainingsrunde", "Trainingsrunde", "Prä Stimmung",
                "Post_Stimmung", "Labor Verabschiedung"]

POI will always be at the beginning, Outro always at the end