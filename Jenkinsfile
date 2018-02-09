pipeline {
  agent any
  stages {
    stage('Lint') {
      steps {
        sh 'yarn install'
        sleep 5s
        sh 'yarn lint'
      }
    }
    stage('Test') {
      steps {
        sh 'docker-compose up --build --abort-on-container-exit'
      }
    }
    stage('Clean') {
      steps {
        sh 'docker system prune --filter "label=CI-TEST=jenkins" -af'
      }
    }
  }
}