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
        sh 'docker pull mongo'
        sleep 20
        sh 'docker run --rm -p 27017:27017 mongo'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
}