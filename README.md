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

Installation (Users)
---
1. Under [Releases](https://github.com/eliot-org/eliot/releases), select the latest version
2. Download the provided .exe setup file
3. Execute the downloaded .exe setup file, which will start the installation process
4. Upon completion of the installation, the program will automatically start

Getting Started
---
In work

Support
---
You can ask questions, receive support, and report bugs under the [Issues](https://github.com/eliot-org/eliot/issues) section in the git repository.

Future Developments
---
- Survey Builder - create surveys using a graphical interface rather than writing a JSON file
- Conditions/Loops - display pages conditionally or in loops
- Page Customizability - dont like the default theme? Change pages to your liking with HTML and CSS
- New Stimuli

Installation (Development)
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
