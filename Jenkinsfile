#!groovy


def label = "jenkins"
env.DOCKERHUB_IMAGE = "devops53/hello-world"

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  name: jenkins-slave
  namespace: jenkins
  labels:
    component: ci
    jenkins: jenkins-agent
spec:
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
    image: bitnami/kubectl:latest
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
    - mountPath: /var/lib/docker
      name: dind-storage 
  - name: helm
    image: lachlanevenson/k8s-helm:v2.16.1
    command:
    - cat
    tty: true
"""
  )

        {

            node(label) {

                stage('Checkout SCM') {
                    checkout scm
                    shortCommit = sh(returnStdout: true, script: "git rev-parse HEAD").trim().take(7)
                }

                stage('Build node.js app') {
                    container('nodejs') {
                        sh 'npm install'
                    }
                }
                stage('Test node.js app') {
                    container('nodejs') {
                        sh """
                           npm install mocha chai --save-dev
                           npm install request --save-dev
                           node index.js &
                           npm test
                           """
                    }
                }
                def tag = env.BRANCH_NAME
                if (!isBuildingTag()) {
                    tag = shortCommit
                }
                stage('Build docker image') {
                    container('docker') {
                        sh "docker build . -t ${DOCKERHUB_IMAGE}:$tag"
                    }
                }
                if (!isPullRequest()) {
                    stage('Docker push') {
                        container('docker') {
                            withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                                sh """
                               docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
                               docker push ${DOCKERHUB_IMAGE}:$tag
                               """
                            }
                        }
                    }
                }
                if (!isPushToAnotherBranch()) {
                    stage('Trigger Deploy') {
                        build job: 'PipelineForDeploy', parameters: [string(name: 'tagFromJob1', value: tag, description: 'last commit')]
                    }
                }
            }
        }
            
                boolean isPullRequest() {
                    return (env.BRANCH_NAME ==~ /^PR-\d+$/)
                }
                boolean isMaster() {
                    return (env.BRANCH_NAME == "master")
                }
                boolean isBuildingTag() {
                    return (env.BRANCH_NAME ==~ /^v\d+.\d+.\d+$/ || env.BRANCH_NAME ==~ /^\d+.\d+.\d+$/)
                }

                boolean isPushToAnotherBranch() {
                    return (!isMaster() && !isBuildingTag() && !isPullRequest())
                }
