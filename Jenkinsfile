pipeline {
 
 
  environment {
    BRANCHNAME="${BRANCH}"
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
  - name: dind-storage
    emptyDir: {}
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
    image: docker:19-git
    command:
    - cat
    tty: true
    env:
    - name: DOCKER_HOST
      value: tcp://docker-dind:2375
    volumeMounts:
      - name: dind-storage
        mountPath: /var/lib/docker
  - name: helm
    image: lachlanevenson/k8s-helm:latest
    command:
    - cat
    tty: true
"""
}
}


 stages {
  stage('RUN Unit Tests') {
    steps {
      container('nodejs') {
          sh "npm install" ;
          sh "npm test" ; 
        }
      }
  }
  stage ('Helm create') {
   steps {
      container ('helm') {
        sh "helm version"
        sh "helm create app" ;
        }
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
           docker build -t $DOCKER_PROJECT_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG .
           docker push $DOCKER_PROJECT_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG
            """
            }   
        }
    }
     }
  }
}

