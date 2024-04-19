# ELIOT Experiment Builder

<p align="center"><img src="/src/renderer/assets/eliot.png" alt="ELIOT Brain" width="200"/></p>

A graphical builder interface for your scientific expirements and surveys. Made with JavaScript, Vue & Electron and completely open-source.
Compatible with a variety of external hardware.

Features
---
- Modern UI - simple and beautiful graphical interface
- Hardware - integrate various external devices into an experiment. Synchronization between devices as well as conditional execution is possible
  - Our scripts provide functionality for EEG equipment, scales, lights, arduinos and robots
  - Write your own scripts using the full power of JavaScript and npm packages
- OpenSource - released under [CC-BY-NC-4.0](https://github.com/eliot-org/eliot-experiment-builder/blob/main/LICENSE.md)
- JSON - create surveys using easy-to-understand JSON files
- HTML/CSS - Use HTML and CSS to customize the look of an experiment according to your specific needs
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
4. Upon completion of the installation, the program should automatically start

Getting Started
---
There are a couple of setup steps to undertake after the installation has finished in order to use the program fully.
  - Go to the settings page
    - Choose in which folder your hardware scripts, and assets(images) are located
    - Then, import at least one survey json file. An example can be found [here](https://github.com/eliot-org/eliot/blob/main/src/renderer/assets/survey_sample.json). A Stroop example is also available [here](https://github.com/eliot-org/eliot/blob/main/src/renderer/assets/stroop.json)
  - Go to the objects page
    -  Create an object by setting a name and potentially properties that are needed by your survey
    -  In the case of the Stroop example, create objects with a property called "color", for the text color and another property called "text" that is then shown as the text itself
  - Then, if your survey needs subject data, go to the subjects page
    - Create a subject with accompanying properties
  - If your survey needs hardware devices, connect them on the hardware page
    
You have now finished the basic setup and are ready to run your survey on the survey page

### How to run a survey
  - Choose a survey from the list
  - Add the desired modules
  - Set their objects, if needed by the selected survey.
  - Choose if you want to randomize some parts of a module
  - Set experiment settings
  - Choose which display to show the survey window on
  - Press start
  
### How to write survey files
A survey file is a single file that describes an experiment, including all hardware interactions, as well as the use of the properties of objects and subjects. In order to be able to write survey files you should familiarize yourself with the json text format and [JSON Schema](https://json-schema.org/). Once youve done this you should take a look at the example survey file that can be found [here](https://github.com/eliot-org/eliot/blob/main/src/renderer/assets/survey_sample.json). To be able to write a correct survey file, follow the json schemata that can be found in the schemas folder in the repository. There, multiple files stack on top of each other, because json schema is still missing some features. The main `surveyfile.json` file in the schemas folder describes the main structure of survey files. The files in the subfolders describe parts of the survey file that are interchangable and depend on the value of the `pagetype` property you choose. Speaking in more detail, the value of the content property depends on which page type is chosen. The different value options are described in the files in the subfolders. The same goes for the value of the `options` property of the question pagetype, where you can find the different possibilities in the questiontypes subfolder.

#### How to create and use a new survey file:
  - Create a new file of the type .json
  - Write your survey according to the schemata (use the example file as reference)
  - Import the finished file on the settings page
  - Use it

### Regarding Hardware Scripts
  - Example implementations can be found [here](https://github.com/eliot-org/eliot/tree/main/src/main/scripts)
  - After importing scripts, go to the hardware page and connect to your devices (using port names, IP addresses, or whatever else is specified)
  - Commands that can be used in survey files are listed on the hardware page (described by the value of the "name" property)

### How to export data
  - Go to the Measurements page in the Main Window of the application
  - If you have finished at least on experiment already, then their results will be visible here
  - Press one of the Download Buttons to export the data either in their native JSON format or converted to CSV with additional data in an additional JSON file

### Assets / Stimuli
You can use images, videos and sounds in your experiments, for example as stimuli. To be able to use them you need to follow these steps:
  - Put all of your assets in a single folder
  - On the Settings page, select a location for the assets folder

Now, if you want to use these in an experiment, then you need to add their filename as the value of a property to either a subject or an object. This can then be used in an experiment by adding ``{{obj.propertyName}}`` or ``{{subj.propertyName}}`` at the desired points in the survey. Our example json shows how this works.

Support
---
You can ask questions, receive support, and report bugs under the [Issues](https://github.com/eliot-org/eliot/issues) section in the git repository.

Possible Future Developments
---
- Survey Builder - create surveys using a graphical interface rather than writing a JSON file
- Conditions - display pages conditionally
- Page Customizability - dont like the default theme? Change pages to your liking with HTML and CSS
- New Stimuli

Installation (Development)
---
This section describes how to build the program from source. This is only needed if you are making changes to the source code. If you are a normal user, refer to the installation section for users. 
#### Build Setup

``` bash
# clone the repository
git clone git@github.com:eliot-org/eliot.git

# install dependencies, currently with need for legacy packages
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# in case of problems with serialport run this
npm run rebuild

```
#### Requirements:
- Python 2.7
- Visual Studio C/C++ Build Tools
- NodeJS

Citation
---
We kindly request that you cite ELIOT if you use it in your research. Here's how to cite the current preprint:

> Hilgers, T., Schweiger, L., Müller, S., & Heim, H. (2024, April 19). ELIOT: A Hardware Focused Experiment Builder. [https://doi.org/10.31234/osf.io/xnzkt](https://doi.org/10.31234/osf.io/xnzkt)

License
---
This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
The license holder is [imat-uve gmbh](https://imat-uve.de). Thanks to them we are able to continue our work that has started while we were employed there. 
