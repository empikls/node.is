pipeline {

  environment {
    APP_NAME = "hello-world "
    STORAGE_CREDS = "${PROJECT}"
    IMAGE_TAG = "eu.gcr.io/${PROJECT}/${APP_NAME}:${GIT_COMMIT}"
    JENKINS_CRED = "${PROJECT}"
    APP_REPO="https://github.com/empikls/node.is"
    NAMESPACE="jenkins"
    BRANCHNAME="${BRANCH}"
    DOCKERREGISTRY="devops53/hello-app"
    CI = 'true'
  }

 agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
metadata:
  name: jenkins-slave
  namespace: jenkins
  labels:
    component: ci
    jenkins: jenkins-agent
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: jenkins
  volumes:
  - name: cache-volume
    emptyDir: 
  containers:
  - name: git
    image: alpine/git
    command:
    - cat
    tty: true
  - name: nodejs
    image: node:latest
    command:
    - cat
    tty: true
  - name: docker-daemon
    image: docker:19.03.1-dind
    securityContext:
      privileged: true
    env:
      - name: DOCKER_HOST
        value: tcp://localhost:2375
"""
}
}

 stages {
            stage('Checkout') {
        steps {
            git branch: 'master', url: "${APP_REPO}"
        }
        }
        stage('Build') {
        steps {
        container('nodejs'){
            sh 'npm install'
            
          }
        }
    }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh 'printenv'
            }
        }
    }
}
