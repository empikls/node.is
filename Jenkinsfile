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
        sh 'git rev-parse HEAD > GIT_COMMIT'
        shortCommit = readFile('GIT_COMMIT').take(7)
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
    stage('Build docker image') {
      container('docker') {
        if ( !isChangeSet() && !isMaster() ) {
            echo "Build docker image with tag ${BRANCH_NAME}"
            sh "docker build . -t ${DOCKERHUB_IMAGE}:${BRANCH_NAME}"
        }
        else {
          if (  !isChangeSet() && !isBuildingTag() ) {
            echo "Build docker image with tag ${shortCommit}"
            sh "docker build . -t ${DOCKERHUB_IMAGE}:${shortCommit}"
          }
        }
      }
    }
        if ( isPullRequest() ) {
          return 0  
        }
      stage('Docker push') {
      container('docker') {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
          if ( !isChangeSet() && !isMaster() ) {
            echo "Push docker image with tag ${BRANCH_NAME}"
            sh """
             docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
             docker push ${DOCKERHUB_IMAGE}:${BRANCH_NAME}
            """
          }
          else {
            if ( !isChangeSet() && !isBuildingTag() ) {
            echo "Push docker image with tag ${shortCommit}"
            sh """
             docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
             docker push ${DOCKERHUB_IMAGE}:${shortCommit}
            """
            }
          }
          
        } 
      } 
    }
      
        
        stage('Trigger another job') {
        def handle = triggerRemoteJob (
          auth: CredentialsAuth(credentials: 'jenkins2'),
          job: 'https://jenkins-50-23-5-248.nip.io/job/IBM_Project/job/JavaWebApp/job/0.0.0'
          )
        echo 'Remote Status: ' + handle.getBuildStatus().toString()
      }

          if ( isPushToAnotherBranch() ) {
            return 0
          }
    def tagDockerImage
    def nameStage
    def hostname
            if ( isChangeSet() ) {
                stage('Deploy to Production') {
                        nameStage = "app-prod"
                        namespace = "prod"
                        tagDockerImage = "${sh(script:'cat production-release.txt',returnStdout: true)}"
                        hostname = "prod-184-173-46-252.nip.io"
                            deploy( nameStage, namespace, tagDockerImage, hostname  )
                }
            }
            else if ( isMaster() ) {
                stage('Deploy dev version') {
                    nameStage = "app-dev"
                    namespace = "dev"
                    tagDockerImage = readFile('GIT_COMMIT').take(7)
                    hostname = "dev-184-173-46-252.nip.io"
                        deploy( nameStage, namespace, tagDockerImage, hostname )
                }
            }
            
            else if ( isBuildingTag() ) {
                stage('Deploy to QA stage') {
                    nameStage = "app-qa"
                    namespace = "qa"
                    tagDockerImage = env.BRANCH_NAME
                    hostname = "qa-184-173-46-252.nip.io"
                        deploy( nameStage, namespace, tagDockerImage, hostname )
                }
            }   
            
    }
}    

    boolean isPullRequest() {
      return (env.BRANCH_NAME ==~  /^PR-\d+$/)
    }
    boolean isMaster() {
      return (env.BRANCH_NAME == "master" )
    }
    boolean isBuildingTag() {
      return ( env.BRANCH_NAME ==~ /^v\d.\d.\d$/ || env.BRANCH_NAME ==~ /^\d.\d.\d$/)
    }

    boolean isPushToAnotherBranch() {
      return ( ! isMaster() && ! isBuildingTag() && ! isPullRequest() )
    }
    
    boolean isChangeSet() {


      // new version
        currentBuild.changeSets.any { changeSet -> 
          changeSet.items.any { entry -> 
            entry.affectedFiles.any { file -> 
              if (file.path.equals("production-release.txt")) {
                return true
              }
            }
          }
        }

      // one more try 
      // currentBuild.changeSets*.items*.affectedFiles.find { it.path.equals("production-release.txt") }

     // previous version
      // def changeLogSets = currentBuild.changeSets
      // for (int i = 0; i < changeLogSets.size(); i++) {
      //   def entries = changeLogSets[i].items
      //   for (int j = 0; j < entries.length; j++) {   
      //     def files = new ArrayList(entries[j].affectedFiles)
      //     for (int k = 0; k < files.size(); k++) {
      //         def file = files[k]
      //         if (file.path.equals("production-release.txt")) {
      //             return true
      //         }
      //     }
      //   }
      // }

  }
    def deploy( appName, namespace, tagName, hostName ) {
      container('helm') {
          echo "Release image: ${shortCommit}"
          echo "Deploy app name: $appName"
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
         helm upgrade --install $appName --debug --force ./app \
            --namespace=$namespace \
            --set image.tag="$tagName" \
            --set ingress.hostName=$hostName \
            --set-string ingress.tls[0].hosts[0]="$hostName" \
            --set-string ingress.tls[0].secretName=acme-$appName-tls 
          """
        }
      }
    }