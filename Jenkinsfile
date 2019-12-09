pipeline {

  environment {
    APP_NAME = "hello-world "
    STORAGE_CREDS = "${PROJECT}"
    JENKINS_CRED = "${PROJECT}"
    APP_REPO="https://github.com/empikls/node.is"
    NAMESPACE="jenkins"
    BRANCHNAME="${BRANCH}"
    DOCKERREGISTRY="devops53/hello-app"
    CI = 'true'
    DOCKER_REGISTRY_URL="registry.hub.docker.com"
    DOCKER_PROJECT_NAMESPACE="devops53"
    IMAGE_NAME="http-app"
    IMAGE_TAG="v1"
    DOCKER_HUB_USER=""
    DOCKER_HUB_PASSWORD=""
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
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:v1.8.8
    command:
    - cat
    tty: true
  - name: docker
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
            git branch: "", url: "${APP_REPO}"
        }
        }

        stage('RUN Unit Tests') {
        steps {
        container('nodejs') {
          sh '''
          npm install
          npm test
          '''  
          }
        }
    }

     stage('Create Docker images') {
      steps{
      container('docker') {
                sh '''
                docker build -t namespace/my-image:${gitCommit} .
                docker push namespace/my-image:${gitCommit}
                '''
            }   
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
