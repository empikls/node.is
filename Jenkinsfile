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
      path: /var/jenkins_home/docker.sock  
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
    image: docker:18.09.2
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/jenkins_home/docker.sock
"""
}
}

 stages {
            stage('Checkout') {
        steps {
            git branch: "master", url: "${APP_REPO}"
        }
        }

        stage('RUN Unit Tests') {
        steps {
        container('nodejs') {
          sh "npm install" ;
          sh "npm test" ; 
          }
        }
    }
     
     stage('Create Docker images') {
       steps{
        container('docker') {
          sh """
            docker build -t ${DOCKER_PROJECT_NAMESPACE}/${IMAGE_NAME}:dev .
            docker push ${DOCKER_PROJECT_NAMESPACE}/${IMAGE_NAME}:dev
            """
            }   
        }
    }
     }
    }

