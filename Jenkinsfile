pipeline {


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
    image: docker:19.03.3-git
    command:
    - cat
    tty: true
    env:
    - name: DOCKER_HOST
      value: tcp://docker-dind:2375
    volumeMounts:
    - mountPath: /cache
      name: cache-volume  
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
        sh """
          npm install 
          npm test
           """
        }
    }
}
  
 stage('Create Docker images') {
       steps{
        container('docker') {
         withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
            sh """
           docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
           docker build -t $IMAGE_NAME:$GIT_BRANCH .
           docker push $DOCKER_PROJECT_NAMESPACE/$IMAGE_NAME
            """
            }
        }
    }
}
  stage ('Helm create') {
   steps {
      container('helm') {
          withKubeConfig([credentialsId: 'kubeconfig']) {
          sh 'helm version'
      }
    }
  }
}     
 }
}


 
