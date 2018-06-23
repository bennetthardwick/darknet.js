#!/usr/bin/env bash

if [ ! -f libdarknet.so ]; then

    if [ ! -d darknet ]; then
        git clone https://github.com/pjreddie/darknet;

        if [ $? -ne 0 ]; then
            echo "Could not clone darknet repo";
            exit 1;
        fi
    fi

    # dive in the darknet folder and make
    cd darknet && make

    if [ $? -ne 0 ]; then
        echo "Could not compile darknet";
        exit 2;
    fi

    # copy lib
    cp libdarknet* ..

    # dive out
    cd ..

    # if macos make .dylib symlink
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ln -s libdarknet.so libdarknet.dylib
    fi

else
    echo "Already built darknet"
fi
