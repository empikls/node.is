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
          echo $CHANGE_ID
           """
        }
    }
}
  
 stage('Create Docker images') {
       steps{
        container('docker') {
         withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
            sh """
           docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
           DOCKER_BUILDKIT=1 docker build . -t ${DOCKER_IMAGE_NAME} 
           docker push ${DOCKER_IMAGE_NAME}
            """
            }
        }
    }
}
  stage ('Helm create') {
   steps {
      container ('helm') {
        withCredentials([file(credentialsId: 'kubeconfig')]) {
        sh """
        helm upgrade --install app \
            --namespace=jenkins \
            --set master.ingress.enabled=true \
            --set-string master.ingress.hostName=ibmsuninters2.dns-cloud.net \
            --set-string master.ingress.annotations."kubernetes.io/tls-acme"=true \
            --set-string master.ingress.annotations."kubernetes.io/ssl-redirect"=true \
            --set-string master.ingress.annotations."kubernetes.io/ingress.class"=nginx \
            --set-string master.ingress.tls[0].hosts[0]=ibmsuninters2.dns-cloud.net \
            --set-string master.ingress.tls[0].secretName=acme-jenkins-tls \
            app
          """
      }
    }
  }
}     
 }
}


 
