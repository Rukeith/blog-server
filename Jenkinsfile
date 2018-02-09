pipeline {
  agent any
  stages {
    stage('Lint') {
      steps {
        sh '''yarn install
yarn lint'''
      }
    }
    stage('Test') {
      steps {
        sh 'yarn test'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
}