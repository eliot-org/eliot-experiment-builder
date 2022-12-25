# ELIOT

<p align="center"><img src="/src/renderer/assets/eliot.png" alt="ELIOT Brain" width="200"/></p>

A graphical builder interface for your scientific expirements and surveys. Made with JavaScript, Vue & Electron and completely open-source.
Compatible with a variety of external hardware.

Features
---
- Modern UI - simple and beautiful graphical interface
- Hardware - integrate various external devices into an experiment. Synchronization between devices as well as conditional execution is possible
  - Our scripts provide functionality for EEG equipment, scales, lights, arduinos and robots
  - Write your own scripts using the full power of JavaScript and npm packages
- OpenSource - released under [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/legalcode.de)
- JSON - create surveys using easy-to-understand JSON files
- Offline - no need for an internet connection in your laboratory

About
---
Eliot was developed for a research project that needed to integrate many different hardware units into an interlocked experiment process. It was found that no existing software had the feature set required for such a project.<br>
We are in the process of publishing a paper on our software that will also function as an introduction and general tutorial.<br>
We hope that our software can help other researchers in similar situations.<br>
<b>New features will be added if interest exists</b>. Just write us in the issue section of this repository.

Future Developments
---
- Survey Builder - create surveys using a graphical interface rather than coding a JSON file
- Conditions/Loops - display pages conditionally or in loops
- Page Customizability - dont like the default theme? Change pages to your liking with HTML and CSS
- New Stimuli

Versions
---
 - ``` 0.2 ``` - Walnut 
 - ``` 0.1 ``` - Blueberry 

Development
---
#### Build Setup

``` bash
# install dependencies, currently with need for legacy packages
npm install --legacy-peer-deps

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

```

We recommend using [yarn](https://yarnpkg.com/). It has proven to be faster and more reliable.

#### Requirements:
- Python 2.7
- Visual Studio C/C++ Build Tools
- NodeJS

Citation
---
TBD - A paper is currently being worked on.

License
---
This project is distributed under the terms of [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/legalcode.de). <br>
The license holder is [imat-uve gmbh](https://imat-uve.de). Thanks to them we are able to continue our work that has started while we were employed there. 
