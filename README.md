![MagicMirrorModuleManager: The open source modular smart mirror platform. ](header.png)


**MagicMirrorModuleManager** is an open source interface built to co-exist with the also open source Raspberry Pi project [MagicMirror²](https://github.com/MichMich/MagicMirror).

## Table Of Contents

- [Installation](#installtion)
- [Configuration](#configuration)
- [Usage](#usage)
- [Known Issues](#known-issues)

## Installation

### Automatic Installer (Raspberry Pi Only!)

Execute the following command on your Raspberry Pi to install MagicMirrorModuleManager:
````
bash -c "$(curl -sL https://raw.githubusercontent.com/ThermalWebCreations/MagicMirrorModuleManager/master/installers/install.sh)"
````

### Manual Installation

1. Download and install the latest [MagicMirror²](https://github.com/MichMich/MagicMirror#usage)
2. Clone the repository and check out the master branch: `git clone https://github.com/EliteByte/MagicMirrorModuleManager`
3. Enter the repository: `cd ~/MagicMirrorModuleManager`
4. Install and run the app: `npm install && npm start`

**Important:** `npm start` does **not** work via SSH, use `DISPLAY=:0 nohup npm start &` instead. This starts the mirror on the remote display.

## Configuration
- To be added.


## Known issues

- No known issues.
