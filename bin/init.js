const co = require('co');
const inquirer = require('inquirer');
const chalk = require('chalk');
const templates = require('../templates');
const download = require('download-git-repo');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process')
const utils = require('./utils');

const { list } = templates;
const prompts = [
  {
    type: 'list',
    name: 'tempName',
    message: '你准备创建:',
    choices: []
  }
];

const questions = [
  {
    name: 'projectName',
    message: '项目的名称',
    default: 'demo'
  }, 
  {
    name: 'projectVersion',
    message: '项目的版本号',
    default: '1.0.0'
  }, 
  {
    name: 'projectDescription',
    message: '项目的简介',
    default: `A project named demo`
  },
  { 
    name: 'isInstall', 
    message: '是否要加载依赖',
    default: 'Y'
  }
];

(() => {
  for (const key in list) {
    if (list.hasOwnProperty(key)) {
      const { name } = list[key];
      prompts[0].choices.push({
       name: name,
       value: name
      })
    }
  }
})();

const generator = function *(input) {
  let tempName = input;
  let path = getPath(input);
  let isInstall = true;
  if (typeof input !== 'string') {
    const answers = yield inquirer.prompt(prompts);
    tempName = answers.tempName;
    path = getPath(tempName);
  }
  if (path) {
    const answers = yield inquirer.prompt(questions);
    let projectName = answers.projectName;
    if(answers.isInstall.toLowerCase() === 'n') {
      isInstall = false;
    }
    downloadTemplate(path, projectName, isInstall);
  }  else {
    console.log(chalk.red(`模版[${tempName}]不存在`))
    process.exit(0);
  }
}

function downloadTemplate(path, projectName, isInstall) {
  const targetPath = `${process.cwd()}/${projectName}`;
  const spanner = ora('  正在构建，请稍等...');
  spanner.start();
  if (fs.existsSync('download')){
    //刪除原文件
    utils.rmdirSync('download');
  }

  download(path, targetPath, (err) => {
    if (err) {
      spanner.fail();
      console.log(chalk.red('构建失败'), err);
      process.exit(0);
    }
    startBuildProject(spanner, targetPath, isInstall)
  })
}

function startBuildProject(spanner, targetPath, isInstall){
  if (isInstall) {
    child_process.execSync('npm install', {cwd: targetPath, stdio: 'inherit'})
  }
  spanner.succeed();
  console.log(chalk.green('项目构建成功'));
  process.exit(0);
}

function getPath(input) {
  for (const key in list) {
    if (list.hasOwnProperty(key)) {
      const t = list[key];
      if (t.name === input) {
        return t.path;
      }
    }
  }
}

module.exports = (input) => {
  co(generator(input))
}