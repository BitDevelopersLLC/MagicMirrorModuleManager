#!/usr/bin/env bash

# This is an installer script for MagicMirrorModuleManager.
# Credit for most of this script goes to MichMich (Author of MagicMirror2)
# Has been altered to serve the ModuleManager created by EliteByte
# https://github.com/MichMich && https://github.com/EliteByte

echo -e "\e[0m"
echo '           _____                    _____                    _____                    _____          '
echo '          /\    \                  /\    \                  /\    \                  /\    \         '
echo '         /::\____\                /::\____\                /::\____\                /::\____\        '
echo '        /::::|   |               /::::|   |               /::::|   |               /::::|   |        '
echo '       /:::::|   |              /:::::|   |              /:::::|   |              /:::::|   |        '
echo '      /::::::|   |             /::::::|   |             /::::::|   |             /::::::|   |        '
echo '     /:::/|::|   |            /:::/|::|   |            /:::/|::|   |            /:::/|::|   |        '
echo '    /:::/ |::|   |           /:::/ |::|   |           /:::/ |::|   |           /:::/ |::|   |        '
echo '   /:::/  |::|___|______    /:::/  |::|___|______    /:::/  |::|___|______    /:::/  |::|___|______  '
echo '  /:::/   |::::::::\    \  /:::/   |::::::::\    \  /:::/   |::::::::\    \  /:::/   |::::::::\    \ '
echo ' /:::/    |:::::::::\____\/:::/    |:::::::::\____\/:::/    |:::::::::\____\/:::/    |:::::::::\____\'
echo ' \::/    / ~~~~~/:::/    /\::/    / ~~~~~/:::/    /\::/    / ~~~~~/:::/    /\::/    / ~~~~~/:::/    /'
echo '  \/____/      /:::/    /  \/____/      /:::/    /  \/____/      /:::/    /  \/____/      /:::/    / '
echo '              /:::/    /               /:::/    /               /:::/    /               /:::/    /  '
echo '             /:::/    /               /:::/    /               /:::/    /               /:::/    /   '
echo '            /:::/    /               /:::/    /               /:::/    /               /:::/    /    '
echo '           /:::/    /               /:::/    /               /:::/    /               /:::/    /     '
echo '          /:::/    /               /:::/    /               /:::/    /               /:::/    /      '
echo '         /:::/    /               /:::/    /               /:::/    /               /:::/    /       '
echo '         \::/    /                \::/    /                \::/    /                \::/    /        '
echo '          \/____/                  \/____/                  \/____/                  \/____/         '
echo '                                                                                                     '
echo -e "\e[0m"

# Define the tested version of Node.js.
NODE_TESTED="v5.1.0"

# Determine which Pi is running.
ARM=$(uname -m) 

# Check the Raspberry Pi version.
if [ "$ARM" != "armv7l" ]; then
	echo -e "\e[91mSorry, your Raspberry Pi is not supported."
	echo -e "\e[91mPlease run MagicMirror on a Raspberry Pi 2 or 3."
	echo -e "\e[91mIf this is a Pi Zero, you are in the same boat as the original Raspberry Pi. You must run in server only mode."
	exit;
fi

# Define helper methods.
function version_gt() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }
function command_exists () { type "$1" &> /dev/null ;}


# Check if we need to install or upgrade Node.js.
echo -e "\e[96mCheck current Node installation ...\e[0m"
NODE_INSTALL=false
if command_exists node; then
	echo -e "\e[0mNode currently installed. Checking version number.";
	NODE_CURRENT=$(node -v)
	echo -e "\e[0mMinimum Node version: \e[1m$NODE_TESTED\e[0m"
	echo -e "\e[0mInstalled Node version: \e[1m$NODE_CURRENT\e[0m"
	if version_gt $NODE_TESTED $NODE_CURRENT; then
		echo -e "\e[96mNode should be upgraded.\e[0m"
		NODE_INSTALL=true

		# Check if a node process is currenlty running.
		# If so abort installation.
		if pgrep "node" > /dev/null; then
			echo -e "\e[91mA Node process is currently running. Can't upgrade."
			echo "Please quit all Node processes and restart the installer."
			exit;
		fi

	else
		echo -e "\e[92mNo Node.js upgrade necessary.\e[0m"
	fi

else
	echo -e "\e[93mNode.js is not installed.\e[0m";
	NODE_INSTALL=true
fi

# Install or upgrade node if necessary.
if $NODE_INSTALL; then
	
	echo -e "\e[96mInstalling Node.js ...\e[90m"

	# Fetch the latest version of Node.js from the selected branch
	# The NODE_STABLE_BRANCH variable will need to be manually adjusted when a new branch is released. (e.g. 7.x)
	# Only tested (stable) versions are recommended as newer versions could break MagicMirror.
	
	NODE_STABLE_BRANCH="6.x"
	curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_BRANCH | sudo -E bash -
	sudo apt-get install -y nodejs
	echo -e "\e[92mNode.js installation Done!\e[0m"
fi

# Install MagicMirror
cd ~
if [ -d "$HOME/MagicMirrorModuleManager" ] ; then
	echo -e "\e[93mIt seems like MagicMirrorModuleManager is already installed."
	echo -e "To prevent overwriting, the installer will be aborted."
	echo -e "Please rename the \e[1m~/MagicMirrorModuleManager\e[0m\e[93m folder and try again.\e[0m"
	echo ""
	echo -e "If you want to upgrade your installation run \e[1m\e[97mgit pull\e[0m from the ~/MagicMirrorModuleManager directory."
	echo ""
	exit;
fi

echo -e "\e[96mCloning MagicMirrorModuleManager ...\e[90m"
if git clone https://github.com/EliteByte/MagicMirrorModuleManager.git; then 
	echo -e "\e[92mCloning MagicMirrorModuleManager Done!\e[0m"
else
	echo -e "\e[91mUnable to clone MagicMirrorModuleManager."
	exit;
fi


# Use pm2 control like a service MagicMirror
read -p "Do you want use pm2 for auto starting of your MagicMirrorModuleManager (y/n)?" choice
if [[ $choice =~ ^[Yy]$ ]]; then
    sudo npm install -g pm2
    sudo su -c "env PATH=$PATH:/usr/bin pm2 startup linux -u pi --hp /home/pi"
    pm2 start ~/MagicMirrorModuleManager/installers/pm2_MagicMirrorModuleManager.json
    sudo pm2 startup systemd -u pi --hp /home/pi
    pm2 save
fi

echo " "
echo -e "\e[92mWe're ready! Run \e[1m\e[97mDISPLAY=:0 npm start\e[0m\e[92m from the ~/MagicMirror directory to start your MagicMirror.\e[0m"
echo " "
echo " "
