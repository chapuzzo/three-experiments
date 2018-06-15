#!/bin/bash
currentBranch=$(git symbolic-ref HEAD --short)
npm run build && npm run deployto three_${currentBranch}
