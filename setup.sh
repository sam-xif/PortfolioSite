#!/bin/bash
# setup script for portfolio-site
SITE_DIR=portfolio-site

pushd $SITE_DIR

bundle install --path=../gems --binstubs=../gems/bin

popd


