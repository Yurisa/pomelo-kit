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
const downloadPath = path.join(__dirname, '../', 'download');
const prompts = [
  {
    type: 'list',
    name: 'tempName',
    message: '你准备创建:',
    choices: []
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
    console.log(tempName);
    path = getPath(tempName);
  }
  if (path) {
    const answers = yield inquirer.prompt([
      {name: 'projectName', type: 'input', message: '请输入项目名称(demo)'},
      {name: 'isInstall', type: 'input', message: '是否要加载依赖(Y/n)'}
    ]);
    let projectName = answers.projectName;

    if (!projectName) {
      projectName = 'demo';
    }
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
  const spanner = ora('  正在构建，请稍等...');
  spanner.start();
  if (fs.existsSync('download')){
    //刪除原文件
    utils.rmdirSync('download');
  }
  download(path, downloadPath, (err) => {
    if (err) {
      spanner.stop();
      console.log(chalk.red('构建失败'), err);
      process.exit(0);
    }
    startBuildProject(spanner, projectName, isInstall)
  })
}

function startBuildProject(spanner,projectName, isInstall){
  let targetPath = `${process.cwd()}/${projectName}`;
  utils.copyDirSync(downloadPath, targetPath);
  if (isInstall) {
    child_process.execSync('npm install', {cwd: targetPath, stdio: 'inherit'})
  }
  console.log(chalk.green('项目构建成功'));
  spanner.stop();
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