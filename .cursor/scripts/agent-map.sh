#!/usr/bin/env bash
# Agent-to-Team mapping for voice targeting and per-agent Claude Code sessions.
# Used by voice-to-swarm.sh and swarm-launcher.sh.
#
# Format: resolve_agent <name> prints "team|agent-file-basename"
# If the name IS a team, prints "TEAM|<team-name>"

BOILERPLATE="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"

resolve_agent() {
    local NAME=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

    # Check if it's a team name first
    case "$NAME" in
        hq|headquarters)    echo "TEAM|hq"; return 0 ;;
        pkgs|packages)      echo "TEAM|pkgs"; return 0 ;;
        wcr|world-cup*)     echo "TEAM|wcr"; return 0 ;;
        qcr|quikcar*)       echo "TEAM|qcr"; return 0 ;;
        fmo|find-my*)       echo "TEAM|fmo"; return 0 ;;
        s962|962|site962)   echo "TEAM|s962"; return 0 ;;
        qcarry|quikcarry)   echo "TEAM|qcarry"; return 0 ;;
        devops)             echo "TEAM|devops"; return 0 ;;
        trackit)            echo "TEAM|trackit"; return 0 ;;
        pgcmc)              echo "TEAM|pgcmc"; return 0 ;;
        qn|quiknation)      echo "TEAM|qn"; return 0 ;;
        st|seeking*)        echo "TEAM|st"; return 0 ;;
        slk|slack)          echo "TEAM|slk"; return 0 ;;
        clara-agents|claraagents) echo "TEAM|clara-agents"; return 0 ;;
        cp-team|clara-platform)   echo "TEAM|cp-team"; return 0 ;;
        clara-code|claracode)     echo "TEAM|clara-code"; return 0 ;;
    esac

    # HQ agents
    case "$NAME" in
        gran|granville)             echo "hq|granville"; return 0 ;;
        mary|bethune)               echo "hq|mary-bethune"; return 0 ;;
        katherine|kj)               echo "hq|katherine-johnson"; return 0 ;;
        philip|a-philip)            echo "hq|a-philip"; return 0 ;;
        ruby)                       echo "hq|ruby-dee"; return 0 ;;
        ossie)                      echo "hq|ossie-davis"; return 0 ;;
        gary|garrett-morgan)        echo "hq|gary-morgan"; return 0 ;;
        roy|campanella)             echo "hq|roy-campanella"; return 0 ;;
        maya|angelou)               echo "hq|maya-angelou"; return 0 ;;
        nikki|giovanni)             echo "hq|nikki-giovanni"; return 0 ;;
        carter|woodson)             echo "hq|carter"; return 0 ;;
        william-wells|wells-brown)  echo "hq|william-wells-brown"; return 0 ;;
        rian)                       echo "hq|rian"; return 0 ;;
    esac

    # Packages agents
    case "$NAME" in
        nannie|burroughs)       echo "pkgs|nannie"; return 0 ;;
        mark|dean)              echo "pkgs|mark"; return 0 ;;
        george|carver)          echo "pkgs|george"; return 0 ;;
        cheikh|diop)            echo "pkgs|cheikh-anta-diop"; return 0 ;;
        ben|bradley)            echo "pkgs|ben"; return 0 ;;
    esac

    # DevOps agents
    case "$NAME" in
        robert|smalls)          echo "devops|robert-smalls"; return 0 ;;
        gordon|parks)           echo "devops|gordon"; return 0 ;;
        wentworth|cheswell)     echo "devops|wentworth-cheswell"; return 0 ;;
        john-mercer|langston)   echo "devops|john-mercer-langston"; return 0 ;;
        harriet|tubman)         echo "devops|harriet"; return 0 ;;
        bessie|coleman)         echo "devops|bessie"; return 0 ;;
        abbott)                 echo "devops|robert-abbott"; return 0 ;;
    esac

    # WCR agents
    case "$NAME" in
        althea|gibson)          echo "wcr|althea"; return 0 ;;
        lewis|latimer)          echo "wcr|lewis"; return 0 ;;
        daniel|williams)        echo "wcr|daniel"; return 0 ;;
        faith|ringgold)         echo "wcr|faith"; return 0 ;;
        augusta|savage)         echo "wcr|augusta"; return 0 ;;
        oscar|micheaux)         echo "wcr|oscar"; return 0 ;;
        jesse|blayton)          echo "wcr|jesse-blayton"; return 0 ;;
        stagecoach|mary-fields) echo "wcr|mary-fields"; return 0 ;;
    esac

    # QCR agents
    case "$NAME" in
        maggie|walker)          echo "qcr|maggie"; return 0 ;;
        norbert|rillieux)       echo "qcr|norbert"; return 0 ;;
        percy|julian)           echo "qcr|percy"; return 0 ;;
        alma|thomas)            echo "qcr|alma"; return 0 ;;
        janet|collins)          echo "qcr|janet"; return 0 ;;
        constance|motley)       echo "qcr|constance"; return 0 ;;
        dorothy-v|vaughan)      echo "qcr|dorothy-vaughan"; return 0 ;;
        otis|boykin)            echo "qcr|otis-boykin"; return 0 ;;
        mae|jemison)            echo "qcr|mae"; return 0 ;;
    esac

    # Clara Agents team
    case "$NAME" in
        biddy|mason)                    echo "clara-agents|biddy-mason"; return 0 ;;
        james-a|james-armistead|armistead-lafayette) echo "clara-agents|james-armistead-lafayette"; return 0 ;;
        alonzo|herndon)                 echo "clara-agents|alonzo-herndon"; return 0 ;;
        solomon|fuller)                 echo "clara-agents|solomon-fuller"; return 0 ;;
        malone|annie-malone)            echo "clara-agents|annie-malone"; return 0 ;;
        aaron|douglas)                  echo "clara-agents|aaron-douglas"; return 0 ;;
        blackwell|david-blackwell)      echo "clara-agents|david-blackwell"; return 0 ;;
        henson|matthew-henson)          echo "clara-agents|matthew-henson"; return 0 ;;
    esac

    # FMO agents
    case "$NAME" in
        annie)                  echo "fmo|annie"; return 0 ;;
        elijah|mccoy)           echo "fmo|elijah"; return 0 ;;
        septima|clark)          echo "fmo|septima"; return 0 ;;
        virgil|abloh)           echo "fmo|virgil"; return 0 ;;
        elizabeth|catlett)      echo "fmo|elizabeth"; return 0 ;;
        lois|mailou)            echo "fmo|lois"; return 0 ;;
        jan|matzeliger)         echo "fmo|jan"; return 0 ;;
        madam-cj|cj-walker)     echo "fmo|madam-cj-walker"; return 0 ;;
        paul|cuffee)            echo "fmo|paul"; return 0 ;;
    esac

    # Site962 agents
    case "$NAME" in
        josephine|baker)        echo "s962|josephine"; return 0 ;;
        ernest|just)            echo "s962|ernest"; return 0 ;;
        vivien|thomas)          echo "s962|vivien"; return 0 ;;
        jean-michel|basquiat)   echo "s962|jean-michel"; return 0 ;;
        fela|kuti)              echo "s962|fela-kuti"; return 0 ;;
        nina|simone)            echo "s962|nina"; return 0 ;;
        benjamin|banneker)      echo "s962|benjamin"; return 0 ;;
        hiram|revels)           echo "s962|hiram-revels"; return 0 ;;
        denmark|vesey)          echo "s962|denmark"; return 0 ;;
    esac

    # Clara Code agents
    case "$NAME" in
        john-hope|franklin)     echo "clara-code|john-hope"; return 0 ;;
        carruthers|george-c)    echo "clara-code|carruthers"; return 0 ;;
        motley|archibald)       echo "clara-code|motley"; return 0 ;;
        miles|alexander-miles)  echo "clara-code|miles"; return 0 ;;
        claudia|claudia-jones)  echo "clara-code|claudia"; return 0 ;;
    esac

    # QuikCarry agents
    case "$NAME" in
        wendell|scott)          echo "qcarry|wendell"; return 0 ;;
        elbert|cox)             echo "qcarry|elbert-cox"; return 0 ;;
        patterson)              echo "qcarry|charles-patterson-qc"; return 0 ;;
    esac

    # Fallback: check if agent file exists directly
    if [ -f "${BOILERPLATE}/.claude/agents/${NAME}.md" ]; then
        echo "unknown|${NAME}"
        return 0
    fi

    return 1
}

# Get all agents for a team
team_agents() {
    local TEAM=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    case "$TEAM" in
        hq)     echo "granville mary-bethune katherine-johnson a-philip ruby-dee ossie-davis gary-morgan roy-campanella maya-angelou nikki-giovanni carter william-wells-brown" ;;
        pkgs)   echo "nannie mark george cheikh-anta-diop ben" ;;
        devops) echo "robert-smalls gordon wentworth-cheswell john-mercer-langston harriet bessie robert-abbott" ;;
        wcr)    echo "althea lewis daniel faith augusta oscar jesse-blayton mary-fields" ;;
        qcr)    echo "maggie norbert percy alma janet constance dorothy-vaughan otis-boykin mae" ;;
        fmo)    echo "annie elijah septima virgil elizabeth lois jan madam-cj-walker paul" ;;
        s962)   echo "josephine ernest vivien jean-michel fela-kuti nina benjamin hiram-revels denmark" ;;
        qcarry)         echo "wendell elbert-cox charles-patterson-qc" ;;
        clara-agents)   echo "biddy-mason james-armistead-lafayette alonzo-herndon solomon-fuller annie-malone aaron-douglas david-blackwell matthew-henson" ;;
        clara-code)     echo "john-hope carruthers motley miles claudia" ;;
        *)              echo "" ;;
    esac
}

# Get project path for a team
team_project() {
    local TEAM=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    case "$TEAM" in
        hq)      echo "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate" ;;
        pkgs)    echo "/Volumes/X10-Pro/Native-Projects/AI/auset-packages" ;;
        devops)  echo "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate" ;;
        wcr)     echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/world-cup-ready" ;;
        qcr)     echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental" ;;
        fmo)     echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/find-my-outlet" ;;
        s962)    echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/site962" ;;
        qcarry)  echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarry" ;;
        qn)      echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation" ;;
        st)      echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/seekingtalent" ;;
        trackit) echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/trackit" ;;
        pgcmc)   echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/pgcmc" ;;
        slk)            echo "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate" ;;
        clara-agents)   echo "/Volumes/X10-Pro/Native-Projects/Quik-Nation/claraagents" ;;
        clara-code)     echo "/Volumes/X10-Pro/Native-Projects/AI/clara-code" ;;
        *)              echo "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate" ;;
    esac
}
