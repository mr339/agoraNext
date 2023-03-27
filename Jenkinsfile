pipeline {
  agent any
  tools {nodejs "nodejs-16"}
  environment {
    BRANCH = 'ver-8'
    scannerHome = tool 'SonarQubeScan';
    SERVER_IP = getServerIp(env.BRANCH_NAME)
  }
  stages {
        stage('get_commit_msg') {
          agent any
           when {
             anyOf {
                branch 'dev';
                branch 'qa';
                branch 'uat';
             }
            }
          steps {
              script {
                notifyStarted()
                passedBuilds = []
                lastSuccessfulBuild(passedBuilds, currentBuild);
                env.changeLog = getChangeLog(passedBuilds)
                echo "changeLog \n${env.changeLog}"
              }
          }
        }
        stage('Analysis & Deploy') {
          parallel{
            stage('SonarQube Analysis') {
                when {
                    branch 'dev'
                }    
              steps {
                withSonarQubeEnv(installationName: 'SonarQube') {
                sh "${scannerHome}/bin/sonar-scanner"
                }
              }
            }
        stage('Dev Build') {
        agent any
        when {
                branch 'dev'
            }
        steps {
          script {
            sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
            sh '''
            ssh -tt -o StrictHostKeyChecking=no root@$SERVER_IP -p 3030 << EOF
            cd /var/www/rudraksha_stag/react; \
            git pull origin dev; \
            yarn ; \
            yarn build; \
            pm2 restart frontend; \
            exit
            EOF '''
            }
          }
          }
        }
        stage('QA Build') {
        agent any
        when {
                branch 'qa'
            }
        steps {
          script {
            sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
            sh '''
            ssh -tt -o StrictHostKeyChecking=no root@157.245.148.131 -p 3030 << EOF
            pm2 restart avatar-soocket; \
            exit
            EOF '''
            }
            }
          }
        }
        stage('UAT Build') {
        agent any
        when {
                branch 'uat'
            }
        steps {
          script {
            sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
            sh '''
            ssh -tt -o StrictHostKeyChecking=no root@$SERVER_IP -p 3030 << EOF
            cd /var/www/rudraksha_stag/react; \
            sudo git pull origin uat; \
            yarn ; \
            yarn build; \
            pm2 restart frontenuat; \
            exit
            EOF '''
            }
            }
          }
        }
        stage('live Build') {
        agent any
        when {
                branch 'master'
            }
        steps {
          script {
            sshagent(['72c3455a-de8d-4b39-9f02-771ddb2fdf00']) {
            sh '''
            ssh -tt -o StrictHostKeyChecking=no root@157.245.148.131 -p 3030 << EOF
            cd / \
            git pull origin master; \
            composer install; \
            php artisan migrate; \
            php artisan db:seed; \
            yarn install; \
            yarn run dev; \
            exit
            EOF '''
            }
          }
          }
        }
}
        }

  }

  post{
      success{
        script {
          if (env.BRANCH_NAME == 'dev' || env.BRANCH_NAME == 'qa' || env.BRANCH_NAME == 'uat' )
            notifySuccessful()
        }
      }
      failure{
        notifyFailed()
      }
  }
}

def notifyStarted() {
mattermostSend (
  color: "#2A42EE",
  channel: 'rudraksha-jenkins',
  endpoint: 'https://ekbana.letsperk.com/hooks/hh9o8uzhwjgsug1eqwmn4878ja',
  message: "Build STARTED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}


def notifySuccessful() {
mattermostSend (
  color: "#00f514",
  channel: 'rudraksha-jenkins',
  endpoint: 'https://ekbana.letsperk.com/hooks/hh9o8uzhwjgsug1eqwmn4878ja',
  message: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>):\n${changeLog}"
  )
}

def notifyFailed() {
mattermostSend (
  color: "#e00707",
  channel: 'rudraksha-jenkins',
  endpoint: 'https://ekbana.letsperk.com/hooks/hh9o8uzhwjgsug1eqwmn4878ja',
  message: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}
def lastSuccessfulBuild(passedBuilds, build) {
  if ((build != null) && (build.result != 'SUCCESS')) {
      passedBuilds.add(build)
      lastSuccessfulBuild(passedBuilds, build.getPreviousBuild())
   }
}

@NonCPS
def getChangeLog(passedBuilds) {
    def log = ""
    for (int x = 0; x < passedBuilds.size(); x++) {
        def currentBuild = passedBuilds[x];
        def changeLogSets = currentBuild.changeSets
        for (int i = 0; i < changeLogSets.size(); i++) {
            def entries = changeLogSets[i].items
            for (int j = 0; j < entries.length; j++) {
                def entry = entries[j]
                log += "* ${entry.msg} by ${entry.author} \n"
            }
        }
    }
    return log;
  }


def getServerIp(branchName) {
    if("dev".equals(branchName)) {
        return "15.206.101.251";
    } else {
        return "52.15.208.54";
    }
}
