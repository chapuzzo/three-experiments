#!/bin/bash
currentBranch=$(git symbolic-ref HEAD --short)
npm run build && nom run deployto three_${currentBranch}
