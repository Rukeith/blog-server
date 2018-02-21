pipeline {
  agent any
  stages {
    stage('Lint') {
      steps {
        sh 'npm install'
        sleep 10
        sh 'npm run lint'
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