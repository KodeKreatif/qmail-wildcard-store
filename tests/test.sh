#!/bin/bash

rm -rf testdir
DEFAULT="abc"
HOST="host"
export DEFAULT HOST
mkdir -p testdir/abc@host/{cur,new,tmp}
for i in `ls -1 data`;do
    cat data/$i | node ../index.js testdir
    E=$?
    if [ $E -ne 0 ];then
        echo "Error " $E
    fi
done
echo "Delivering normal emails: OK"

DEFAULT="abc-spam"
export DEFAULT
for i in `ls -1 data`;do
    cat data/$i | node ../index.js testdir
    E=$?
    if [ $E -ne 0 ];then
        echo "Error " $E
    fi
done
echo "Delivering spam emails: OK"

DEFAULT="abc-spam"
export DEFAULT
for i in `ls -1 data`;do
    cat data/$i | node ../index.js testdir
    E=$?
    if [ $E -ne 0 ];then
        echo "Error " $E
    fi
done
echo "Delivering spam emails once again: OK"

rm -rf testdir
