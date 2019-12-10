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
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock  
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
    image: docker:dind
    volumeMounts:
    - name: dockersock
      mountPath: "/var/run/docker.sock"
  
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
      stage('Cloning Git') {
      steps {
        git 'https://github.com/gustavoapolinario/node-todo-frontend'
      }
    }
    stage('Build') {
       steps {
         sh 'npm install'
       }
    }
   stage('Test') {
     steps {
       sh 'npm test'
     }
   }
     stage('Create Docker images') {
       steps{
      container('docker') {
        withCredentials([[$class: 'UsernamePasswordMultiBinding',
          credentialsId: 'dockerhub',
          usernameVariable: 'DOCKER_HUB_USER',
          passwordVariable: 'DOCKER_HUB_PASSWORD']]) {
          sh """
            docker login -u ${DOCKER_HUB_USER} -p ${DOCKER_HUB_PASSWORD}
            docker build -t ${DOCKER_PROJECT_NAMESPACE}/${IMAGE_NAME}:dev .
            docker push ${DOCKER_PROJECT_NAMESPACE}/${IMAGE_NAME}:dev
            """
            }   
        }
    }
     }
        stage('Deploy') {
            steps {
                sh '''
                printenv
                '''
            }
        }
    }
}

