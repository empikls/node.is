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
  
 stage('Create Docker images "PR" ') {
    when {
      expression { BRANCH_NAME =~ 'PR-*' }
       }          
       steps{
       container('docker') {
       withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
            sh """
             docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
             docker build -t ${IMAGE_NAME}:${BRANCH_NAME}:${BRANCH_NAME}  .
             docker push ${DOCKERHUB_USER}/${DOCKER_IMAGE_NAME}:${BRANCH_NAME}
            """
            }
        }
    }
 }
   stage ('Build when the file is change ')  {
      when {               
        changeset pattern: "production-release.txt"
            }
      steps {
        container ('docker')
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
                   sh """
                    PROD="${sh(script:'cat production-release.txt',returnStdout: true)}"
                    docker build -t ${IMAGE_NAME}:${BRANCH_NAME}:${PROD}  .
                    docker push ${DOCKERHUB_USER}/${DOCKER_IMAGE_NAME}:${PROD}
                    """
                }
            }
        }

}     
 }



 
